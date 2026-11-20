# KakaruHayate/GSV.CPP

## Resumen

GSV.CPP es un conjunto de pesos y binarios de servidor para [gsv.cpp](https://github.com/KakaruHayate/gsv.cpp), un motor de inferencia escrito en C++ sobre la librería ggml que implementa el pipeline completo de GPT-SoVITS V5 para síntesis de voz (text-to-speech). Lo desarrolla KakaruHayate y se distribuye con licencia MIT. El repositorio no contiene un modelo único, sino los artefactos GGUF necesarios para ejecutar dos variantes del sistema: `v5turbo` (decodificación DMD de 4 pasos) y `v5dev` (32 pasos), junto con los codificadores compartidos (BERT chino, CN-HuBERT y vocoder HiFi-GAN a 48 kHz).

El problema que resuelve es la portabilidad del pipeline GPT-SoVITS: en lugar de depender de PyTorch y ONNX Runtime, gsv.cpp ejecuta todas las etapas (AR, cond, DiT/CFM y vocoder) en C++ sobre backends ggml Vulkan o CPU. Esto permite desplegar TTS con clonación de voz en máquinas sin stack de Python ni GPU dedicada de gran tamaño, y expone un servicio HTTP compatible con la API de `api_v2.py` de GPT-SoVITS, de modo que la GUI GAG puede conectarse directamente.

El modelo declarado en safetensors suma 77.606.402 parámetros, pero esa cifra corresponde solo a una parte de los pesos; el repositorio completo ocupa 7,3 GB e incluye múltiples ficheros GGUF con cuantizaciones fp16, Q8_0 y F32. Soporta chino, inglés, japonés, coreano y cantonés según las etiquetas del autor. Es relevante ahora porque ofrece una vía de despliegue ligera y autocontenida para TTS con clonación de voz, con un paquete portable para Windows y binarios precompilados para Linux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline GPT-SoVITS V5: modelo autorregresivo (AR, s1v3) + cond (enc_p / ref_enc / wns1 / rvq) + DiT/CFM + vocoder HiFi-GAN con sub-pixel upsampling |
| Parametros totales | 77.606.402 (dato de safetensors; el repo completo incluye varios GGUF y ocupa 7,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, Q8_0, F32 |
| Idiomas soportados | zh, en, ja, ko, yue |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml); ONNX solo para datos del frontend (g2pW.onnx) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GPT-SoVITS V5, un sistema TTS de dos etapas: un modelo autorregresivo (AR, variante s1v3) que predice tokens semánticos a partir del texto y la referencia de audio, seguido de una etapa condicional (enc_p, ref_enc, wns1, rvq) y un modelo DiT/CFM que genera el mel-espectrograma, rematado por un vocoder HiFi-GAN de 48 kHz con upsampling sub-pixel implementado en ggml. Todo el pipeline se ejecuta en C++ sobre backend Vulkan o CPU; no se usa ONNX Runtime en ninguna etapa de inferencia.

Los pesos se distribuyen por componente y variante: `gsv-ar-f16.gguf` y `gsv-ar-q8.gguf` para el AR, `gsv-cond-f16.gguf`, `gsv-dit-f16all.gguf` y `gsv-refcode.gguf` para `v5turbo`, y equivalentes `gsv-v5dev-*` para `v5dev`. Los codificadores compartidos son `gsv-bert-f16.gguf` (RoBERTa chino), `gsv-hubert-f16.gguf` (CN-HuBERT) y `gsv-vocoder-f32.gguf`. La variante `v5turbo` emplea decodificación DMD de 4 pasos frente a los 32 pasos de `v5dev`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) con clonación de voz a partir de una referencia de audio de 3 a 10 segundos.
- Dos modos de inferencia: `v5turbo` con DMD de 4 pasos (baja latencia) y `v5dev` con 32 pasos (mayor calidad).
- Soporte multilingüe: chino, inglés, japonés, coreano y cantonés, con modos de mezcla de idiomas y `auto_yue` añadidos en el parche 0.1.1.
- Frontend de texto con G2P (g2pW para chino) y tokenización BERT; el sidecar de Python gestiona esta parte.
- Servicio HTTP con la misma API que `api_v2.py` de GPT-SoVITS, compatible con la GUI GAG.
- Caché de referencia y de frontend de texto (memoización de G2P + BERT) que reduce el tiempo por render.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Clonación de voz para doblaje y localización: con una referencia de 3-10 s el modelo genera habla en el timbre del hablante original, útil para adaptar contenido a zh, en, ja, ko o yue sin re-grabar.
- Generación de audiolibros y narración: el pipeline completo en C++ permite procesar lotes de texto largo en servidores sin GPU de gran tamaño, usando `v5turbo` para minimizar latencia.
- Asistentes de voz embebidos: el binario `gsv_server` con backend CPU funciona sin driver Vulkan, lo que facilita integrarlo en entornos sin aceleración gráfica.
- Prototipado de interfaces conversacionales: la API HTTP compatible con `api_v2.py` permite conectar la GUI GAG o clientes propios para iterar sobre voces y referencias rápidamente.
- Producción de contenido multilingüe: los modos de mezcla de idiomas y `auto_yue` permiten generar frases que combinan chino mandarín, cantonés e inglés en un mismo audio.
- Investigación en TTS: al ser MIT y ejecutarse sobre ggml, sirve como base reproducible para experimentar con cuantizaciones (Q8_0 frente a fp16) y medir impacto en calidad y velocidad.
- Despliegue en Windows de escritorio: el paquete portable `GSV.CPP-win64-0.1.0.zip` con el parche 0.1.2 permite montar un servidor TTS local sin instalar Python ni dependencias adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de tiempo de preprocesado tras el parche 0.1.2: la preparación baja de 700 ms a 0 ms en renders repetidos, la etapa cond de 650 ms a 450 ms y el G2P de 200 ms a 0 ms, con una reducción total de aproximadamente 0,6-1,0 s por render.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 7,3 GB y la variante Q8_0 del AR es aproximadamente la mitad que la fp16.
- GPU recomendadas: no disponibles; el motor soporta backend Vulkan y CPU. El binario precompilado asume baseline AVX2.
- Cabe en GPU consumer: sí, siempre que se disponga de driver Vulkan; el modo `--device cpu` funciona sin GPU.
- Opciones de despliegue: binarios precompilados `gsv_server` para Windows x64 (Vulkan, AVX2) y Linux x64 (Vulkan, AVX2, glibc 2.35+), o compilación desde fuente en [github.com/KakaruHayate/gsv.cpp](https://github.com/KakaruHayate/gsv.cpp). Requiere el sidecar de Python para el frontend de texto y un WAV de referencia.
- Latencia y throughput: no disponibles más allá de los tiempos de preprocesado citados; el modo `v5turbo` (4 pasos DMD) está pensado para menor latencia que `v5dev` (32 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GSV.CPP (GPT-SoVITS V5) | 77.606.402 (safetensors parcial) | no disponible | zh, en, ja, ko, yue | MIT | GGUF |
| GPT-SoVITS upstream | no disponible | no disponible | zh, en, ja, ko, yue | MIT | PyTorch / ONNX |
| XTTS-v2 (Coqui) | no disponible | no disponible | multilingüe | Coqui Public Model License (no comercial) | PyTorch |
| Bark (Suno) | no disponible | no disponible | multilingüe | MIT | PyTorch |

La comparación se limita a características generales porque no hay datos de benchmarks publicados para GSV.CPP. Frente a GPT-SoVITS upstream, la diferencia principal es el motor de inferencia en C++/ggml sin dependencia de PyTorch ni ONNX Runtime. Frente a XTTS-v2, la licencia MIT de GSV.CPP permite uso comercial sin las restricciones de la Coqui Public Model License.

## Limitaciones y advertencias

- Solo soporta GPT-SoVITS V5 (`v5turbo` y `v5dev`); los checkpoints v2, v3 y v4 no son compatibles.
- El vocoder `gsv-vocoder-f32.gguf` almacena tensores `voc.upsub.*` en orden phase-major; los layouts antiguos `voc.ups.*` no se admiten.
- El binario Linux precompilado es una build anterior y no incluye las correcciones del parche 0.1.2 (máscara de atención de HuBERT, caché de referencia, rutas absolutas, skip-first-step); es necesario compilar desde fuente para disponer de ellas en Linux.
- El paquete Windows no incluye audio de referencia; el usuario debe aportar un clip de 3-10 s.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un sistema TTS, el riesgo principal es la fidelidad de la clonación y la pronunciación en idiomas mezclados.
- La licencia MIT permite uso comercial, pero la clonación de voz plantea riesgos de suplantación y requiere consentimiento explícito del hablante de referencia.
- El frontend de texto depende de datos externos (g2pW.onnx de ~608 MB, tokenizador BERT, nltk_data) que deben apuntarse mediante las variables `GSV_G2PW_MODEL` y `GSV_BERT_DIR`.
- No se dispone de información sobre límites de longitud de contexto ni sobre el comportamiento con textos muy largos.

## Enlaces

- [Hugging Face: KakaruHayate/GSV.CPP](https://huggingface.co/KakaruHayate/GSV.CPP)
- [Repositorio gsv.cpp en GitHub](https://github.com/KakaruHayate/gsv.cpp)
- [GPT-SoVITS-Api-GUI (GAG) de AliceNavigator](https://github.com/AliceNavigator/GPT-SoVITS-Api-GUI)
- Paquete Windows: `windows/GSV.CPP-win64-0.1.0.zip` (3,16 GB, sha256 `852eaceb994d7e7422c62cb8153e80f19b2d759382e744d98ba186b3f16fccab`)
- Parche acumulativo 0.1.2: `patch/GSV.CPP-win64-patch-0.1.2.zip` (14 MB, sha256 `a6733730f64b079d91bdd893957ae45c17d8b9dbfe83d569196e51a12c0834e0`)
- Parche 0.1.1 (referencia): `patch/GSV.CPP-win64-patch-0.1.1.zip`
- Binarios de servidor: `server/gsv.cpp-windows-x64-vulkan.zip` y `server/gsv.cpp-linux-x64-vulkan.tar.gz`

# Phoonnx/vits-pl_pl-justyna

## Resumen

vits-pl_pl-justyna es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por WitoldG dentro del proyecto polish_piper_models y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo genera audio a partir de texto en polaco (pl-PL) y está pensado para integrarse en asistentes de voz y aplicaciones que necesitan síntesis local sin depender de servicios en la nube.

La relevancia de este modelo radica en su formato ONNX ligero (el repositorio ocupa 0,1 GB) y su integración con el ecosistema phoonnx/OVOS, lo que permite desplegarlo en entornos domésticos o de borde. La entrada de texto se convierte a fonemas mediante espeak-ng en alfabeto IPA, lo que condiciona tanto la calidad de la síntesis como los requisitos de instalación.

Se trata de un modelo de un solo hablante (voz "justyna"), con licencia MIT, lo que facilita su uso comercial y su redistribución. No se dispone de información sobre el número de parámetros ni la longitud de contexto en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | polaco (pl-PL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Autor original | WitoldG |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de extremo a extremo para síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento o ajuste fino adicionales. El modelo procede del repositorio WitoldG/polish_piper_models y ha sido reempaquetado en formato ONNX por Phoonnx para su uso con la librería phoonnx. La entrada de texto se normaliza y convierte a fonemas mediante `EspeakPhonemizer` de la librería scriptconv, usando espeak-ng (o el port espyak como alternativa).

## Capacidades

- Síntesis de voz a partir de texto en polaco (pl-PL).
- Generación de audio en formato WAV mediante `synthesize_wav`.
- Fonemización automática del texto de entrada mediante espeak-ng en alfabeto IPA.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python (phoonnx) y en navegador (phoonnx.js con entrada espeak o unicode).
- Voz única de un solo hablante ("justyna").
- No se documentan capacidades de clonación de voz, control de emociones, tool calling ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz locales en polaco: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para dar respuestas habladas en un asistente doméstico, funcionando en local sin conexión a servicios externos.
- Síntesis en aplicaciones de escritorio: gracias al formato ONNX y al tamaño reducido del repositorio (0,1 GB), puede embeberse en aplicaciones Python que necesiten leer texto en voz alta en polaco.
- Lectura de contenido web o documentos: el modelo convierte texto normalizado a fonemas y genera audio WAV, adecuado para lectores de pantalla o accesibilidad en polaco.
- Síntesis en el navegador: mediante phoonnx.js y la demo en tigregotico.pt/demo, puede generar voz en polaco del lado del cliente sin backend.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en polaco con una licencia MIT permisiva antes de invertir en modelos comerciales.
- Generación de avisos y notificaciones habladas: para sistemas de megafonía o notificaciones automatizadas en polaco donde se requiere una voz femenina única y consistente.
- Investigación en TTS: como punto de partida reproducible para experimentos con VITS en polaco, dado su empaquetado ONNX y su licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en CPU y en GPUs de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño (0,1 GB) es plausible que funcione en cualquier GPU moderna e incluso en CPU, pero no se aportan datos oficiales.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS VITS).
- Latencia y throughput: no disponibles.
- Dependencia externa: requiere espeak-ng instalado (o el extra `phoonnx[espeak]` con el port espyak); sin él, la fonemización falla.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-pl_pl-justyna | VITS | pl-PL | 0,1 GB (repo) | MIT | ONNX | Hugging Face (Phoonnx) |
| WitoldG/polish_piper_models (otros voces) | VITS / Piper | pl-PL | no disponible | no disponible en la informacion | ONNX / Piper | Hugging Face (WitoldG) |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | no disponible | MIT (segun coleccion) | ONNX | Hugging Face (coleccion VITS de Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta polaco (pl-PL); no se documenta multilingüismo.
- La calidad de la síntesis depende de la fonemización con espeak-ng; el uso del port espyak puede producir errores de pronunciación en algunas palabras, según advierte la model card.
- Es un modelo de un solo hablante (voz "justyna"); no permite cambiar de voz ni clonar.
- No se han publicado métricas objetivas (MOS, inteligibilidad) ni benchmarks, por lo que la evaluación de calidad es subjetiva.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede haber pronunciaciones incorrectas o artefactos de audio ante entradas no normalizadas o fuera de dominio.
- La licencia MIT permite uso comercial, pero la model card remite a los términos del release upstream (WitoldG/polish_piper_models), que no se detallan en la información disponible.
- Requiere instalar espeak-ng o el extra `phoonnx[espeak]`; sin esta dependencia el modelo no funciona.
- No se documentan límites de longitud de texto de entrada; textos muy largos podrían requerir segmentación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-justyna
- Repositorio upstream: https://huggingface.co/WitoldG/polish_piper_models
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

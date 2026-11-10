# fusorlabs/wan2.1-t2v-1.3b-web

## Resumen

Wan2.1-T2V-1.3B-web es una compilación del modelo de generación de vídeo a partir de texto Wan-AI/Wan2.1-T2V-1.3B, publicada por fusorlabs, que empaqueta los pesos originales en dos bundles WebAssembly para ejecutar la inferencia en el navegador sobre CPU del dispositivo. No se distribuye como checkpoint de PyTorch ni safetensors: solo carga en el runtime wan2-1-wasm del proyecto fusor-rs.

El modelo base es un text-to-video de 1.300 millones de parámetros desarrollado por Wan-AI (Alibaba), con un codificador de texto umT5-XXL, un transformer de difusión y un VAE. Esta versión "web" no modifica la arquitectura ni el entrenamiento: aplica cuantización agresiva (4 bits en el codificador de texto, 7 bits en el transformer y el decodificador del VAE) y divide el modelo en dos bundles porque una única memoria WebAssembly no puede superar los 4 GiB.

Su relevancia es la ejecución on-device sin servidor: permite generar vídeo desde un prompt en el navegador, sin GPU dedicada y sin enviar datos a la nube. El repositorio ocupa 5,3 GB y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base Wan2.1-T2V-1.3B) con codificador de texto umT5-XXL y VAE; empaquetado WebAssembly |
| Parametros totales | 1.300 millones (modelo base); tamano del repo 5,3 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en matrices grandes del codificador de texto; 7 bits en transformer de difusion y decodificador VAE; f32 en capas de entrada/salida de pixeles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundles WebAssembly propios del runtime wan2-1-wasm (manifest.json + partes nombradas por hash BLAKE3); no es safetensors ni GGUF ni PyTorch |
| Libreria | fusor-ai |
| Runtime | wan2-1-wasm (CPU del dispositivo, en navegador) |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B (revision 37ec512624d61f7aa208f7ea8140a131f93afc9a) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Wan2.1-T2V-1.3B de Wan-AI: un pipeline de difusión text-to-video compuesto por un codificador de texto umT5-XXL, un transformer de difusión que genera los latentes de vídeo y un VAE que decodifica esos latentes a fotogramas. fusorlabs no aporta detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la información disponible.

La innovación de esta publicación es el proceso de compilación: el perfil `mix` convierte los pesos en dos bundles WebAssembly (`text/`, con el codificador umT5-XXL y su tokenizador en 4 bits, 3.568 MB; y `video/`, con el transformer de difusión y el decodificador del VAE en 7 bits, 1.732 MB) para respetar el límite de 4 GiB por memoria WebAssembly. Cada `manifest.json` lista todos los tensores y partes, y cada parte se nombra con su hash BLAKE3, que el runtime verifica durante la carga. La compilación es reproducible con el comando `just model` del repositorio wan2-1-wasm.

## Capacidades

- Generación de vídeo a partir de un prompt de texto (pipeline text-to-video).
- Inferencia on-device en el navegador sobre CPU, sin GPU ni servidor.
- Ejecución mediante WebAssembly con verificación de integridad de pesos por BLAKE3 en la carga.
- Codificación de texto multilingüe potencial a través de umT5-XXL (idiomas concretos no disponibles).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de vídeo en el navegador sin backend: un usuario escribe un prompt y obtiene un vídeo corto procesado íntegramente en su CPU, lo que elimina costes de servidor y mantiene los datos en el dispositivo.
- Prototipado de aplicaciones creativas: desarrolladores web pueden integrar generación de vídeo en demos o herramientas de edición sin gestionar infraestructura de GPU.
- Privacidad por diseño: escenarios con prompts o material sensible donde no se permite enviar datos a la nube, ya que la inferencia ocurre localmente.
- Educación y experimentación: permite a estudiantes e investigadores probar un modelo de difusión de vídeo real en equipos convencionales mediante el Space de demostración.
- Distribución de demos estáticas: al ser bundles WebAssembly, se pueden servir desde un CDN y cargarse bajo demanda en una página web.
- Evaluación de técnicas de cuantización extrema: sirve como referencia para estudiar la viabilidad de 4 y 7 bits en modelos de difusión de vídeo ejecutados en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU del dispositivo a través del runtime WebAssembly wan2-1-wasm; no requiere GPU.
- VRAM estimada: no aplica (ejecución en CPU); el runtime necesita gestionar dos bundles de 3.568 MB y 1.732 MB, condicionados por el límite de 4 GiB por memoria WebAssembly.
- GPU recomendadas: no disponible; el diseño es explícitamente on-device en CPU.
- Compatibilidad con GPU de consumo: no aplica en esta compilación.
- Opciones de despliegue: navegador con soporte WebAssembly y el runtime wan2-1-wasm; el Space fusorlabs/wan2-1-wasm como demostración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| fusorlabs/wan2.1-t2v-1.3b-web | 1,3 B (base) | no disponible | Bundles WASM | Apache-2.0 | Navegador, CPU |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3 B | no disponible | safetensors/PyTorch | Apache-2.0 | GPU, servidor |
| Otros text-to-video open source de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base original: misma arquitectura y pesos, pero distinto formato, cuantización y plataforma de ejecución. No se dispone de datos de benchmarks para comparar rendimiento entre ambos.

## Limitaciones y advertencias

- Solo carga en el runtime wan2-1-wasm; no es utilizable con PyTorch, transformers, vLLM, llama.cpp ni otras herramientas estándar.
- La cuantización a 4 y 7 bits puede degradar la calidad del vídeo generado respecto al modelo base en precisión completa; no se documenta el impacto.
- La ejecución en CPU del navegador implica latencias altas y posiblemente no aptas para producción interactiva; no se publican cifras.
- El límite de 4 GiB por memoria WebAssembly obliga a dividir el modelo en dos bundles, lo que añade complejidad de carga y gestión de memoria.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni limitaciones de contexto.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Wan-AI/Wan2.1-T2V-1.3B.
- El repositorio no tiene descargas ni likes y fue creado recientemente; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/fusorlabs/wan2.1-t2v-1.3b-web
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Runtime wan2-1-wasm: https://github.com/fusor-rs/wan2-1-wasm
- Libreria fusor-ai: https://github.com/fusor-rs/fusor-ai
- Space de demostracion: https://huggingface.co/spaces/fusorlabs/wan2-1-wasm

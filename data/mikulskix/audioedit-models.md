# mikulskix/audioedit-models

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un espejo de dos exportaciones a ONNX de HT-Demucs (Hybrid Transformer Demucs), el modelo de separación de fuentes musicales desarrollado por Meta AI Research. El autor, mikulskix, lo publica para que la aplicación web AudioEdit pueda ejecutar la separación de pistas (stems) íntegramente en el navegador mediante onnxruntime-web, sin depender de que repositorios de terceros permanezcan en línea. Los archivos son copias byte a byte de las fuentes originales, identificadas con revisiones y hashes SHA-256 concretos.

La relevancia práctica reside en que permite desplegar separación de audio (drums, bass, other, vocals y, en la variante de seis pistas, guitar y piano) en entornos cliente sin backend, con un peso de repositorio de 0,4 GB y licencia MIT. El modelo subyacente, HT-Demucs, combina un codificador/decodificador convolucional con un transformer sobre el espectrograma, y fue presentado en el artículo *Hybrid Transformers for Music Source Separation* (ICASSP 2023).

No se dispone de información sobre parámetros, longitud de contexto ni idiomas, ya que se trata de un modelo de audio y no de texto. La ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HT-Demucs (Hybrid Transformer Demucs): convolucional + transformer sobre espectrograma |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantización | no disponible (exportaciones ONNX en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (dos archivos: `htdemucs_embedded.onnx` y `htdemucs_6s.onnx`) |

## Arquitectura y entrenamiento

HT-Demucs es un modelo híbrido para separación de fuentes musicales que combina un front-end convolucional (codificador/decodificador sobre la forma de onda) con un transformer que opera sobre la representación espectral. Esta combinación permite capturar tanto dependencias locales de corto plazo (transitorios, percusión) como contexto global de la mezcla (estructura armónica, instrumentos sostenidos). El modelo original fue entrenado por Meta AI Research y publicado con licencia MIT en el repositorio `facebookresearch/demucs`.

Este repositorio concreto no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF/DPO, ya que se trata de un espejo de exportaciones. La innovación técnica relevante aquí es la exportación a ONNX para inferencia en navegador: el modelo de seis pistas incluye procesamiento en tiempo de carga (por ejemplo, poda del grafo antes de la iSTFT en el grafo), según indica la model card. Los archivos son idénticos byte a byte a las fuentes `timcsy/demucs-web-onnx` (revisión `92e33df…`) y `StemSplitio/htdemucs-6s-onnx` (revisión `49df9b6…`).

## Capacidades

- Separación de fuentes musicales en cuatro pistas (drums, bass, other, vocals) con `htdemucs_embedded.onnx`.
- Separación en seis pistas (drums, bass, other, vocals, guitar, piano) con `htdemucs_6s.onnx`.
- Inferencia en navegador mediante onnxruntime-web, sin backend.
- Ejecución offline una vez cargado el modelo en el cliente.
- Procesamiento de audio-a-audio (pipeline `audio-to-audio`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Edición de audio en el navegador: la aplicación AudioEdit carga el ONNX y separa pistas localmente, de modo que el usuario no sube su audio a un servidor y se preserva la privacidad.
- Creación de karaokes y pistas de acompañamiento: extraer la pista de vocals permite generar versiones instrumentales sin infraestructura de servidor.
- Remezcla y producción musical: aislar drums, bass y otros instrumentos facilita el sampling y la reorquestación de temas con licencia MIT.
- Educación musical: separar guitar y piano (modelo de seis pistas) ayuda a estudiar partes concretas de una grabación.
- Prototipado de aplicaciones de audio sin backend: el formato ONNX y onnxruntime-web permiten integrar la separación en aplicaciones web estáticas o PWA.
- Archivado y restauración: separar y recomponer pistas para limpiar o realzar instrumentos en grabaciones antiguas.
- Investigación en separación de fuentes: servir como referencia reproducible con hashes SHA-256 verificables para comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como SDR, SI-SDR ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,4 GB, lo que da una cota superior aproximada del espacio de pesos, pero no se especifica el consumo en ejecución.
- GPU recomendadas: no disponible. Al ejecutarse vía onnxruntime-web, el cómputo puede realizarse en CPU del navegador o con aceleración WebGPU/WASM según el runtime.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: onnxruntime-web (navegador), onnxruntime (escritorio/servidor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Pistas | Formato | Licencia | Contexto de ejecución |
|---|---|---|---|---|
| HT-Demucs (este espejo ONNX) | 4 y 6 | ONNX | MIT | Navegador (onnxruntime-web) |
| HT-Demucs original (Meta) | 4 | PyTorch | MIT | Servidor/escritorio |
| Demucs v3 | 4 | PyTorch | MIT | Servidor/escritorio |

No se dispone de datos de rendimiento comparado (SDR u otras métricas) en la información proporcionada, por lo que la comparación se limita a formato, licencia y modo de ejecución.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- No se han publicado métricas de calidad (SDR, artefactos) en la información disponible; el rendimiento real de separación no está cuantificado aquí.
- El modelo de seis pistas incluye poda del grafo en tiempo de carga en la aplicación, lo que puede introducir diferencias respecto a la inferencia del modelo original.
- La licencia MIT permite uso comercial, pero conviene conservar la atribución a Meta AI Research, timcsy y StemSplitio según la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Al ser un espejo, la responsabilidad de actualizaciones y correcciones recae en las fuentes originales; los hashes SHA-256 permiten verificar la integridad.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas por no tratarse de un modelo generativo de texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mikulskix/audioedit-models
- Fuente del modelo de 4 pistas: https://huggingface.co/timcsy/demucs-web-onnx
- Fuente del modelo de 6 pistas: https://huggingface.co/StemSplitio/htdemucs-6s-onnx
- Repositorio original de Demucs (Meta AI Research): https://github.com/facebookresearch/demucs
- Artículo: Rouard, Massa, Défossez, *Hybrid Transformers for Music Source Separation*, ICASSP 2023.

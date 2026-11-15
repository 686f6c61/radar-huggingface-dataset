# samuelr3/hear-magic-clean

## Resumen

Hear Magic Clean es un modelo de mejora de voz (speech enhancement) y supresión de ruido publicado por el usuario samuelr3 en Hugging Face. Se trata de un fine-tuning de MossFormer2_SE_48K, el modelo de mejora de voz a 48 kHz desarrollado por Alibaba, adaptado sobre grabaciones reales del servicio Hear, una herramienta que limpia grabaciones de voz para periódicos hablados del Reino Unido (talking newspapers). El modelo forma parte de una segunda etapa de limpieza que se ejecuta después de DeepFilterNet3 dentro del pipeline denominado Magic Clean.

El modelo resuelve un problema muy concreto: eliminar toses, estornudos, ladridos, portazos y ruido de fondo de grabaciones de lectura en voz alta, preservando la voz del lector. No es un modelo generativo de texto ni un asistente conversacional, sino un modelo de audio-a-audio que produce máscaras espectrales para filtrar el ruido. Con 55,3 millones de parámetros y un peso de 221 MB en safetensors (225 MB en TorchScript), está pensado para ejecutarse en GPU en un pipeline de producción de audio.

Su relevancia radica en su especialización: en lugar de un modelo genérico de mejora de voz, es un ajuste fino sobre un dominio muy específico (lecturas de talking newspapers) con un mecanismo de seguridad (speech guard) que recupera la salida de DeepFilterNet3 cuando el modelo elimina habla suave, como terminaciones de palabras. La licencia es mixta ("mixed-see-licences"), lo que exige revisión legal antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossFormer2 (transformer con atención lineal y convoluciones, fine-tuned) |
| Parametros totales | 55,3 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 4 segundos (496 frames, 180 features por frame); paso de 3 segundos |
| Tipos de cuantizacion | no disponible (pesos en float32; TorchScript y safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | mixed-see-licences (other) |
| Formato de pesos | TorchScript (.pt), safetensors, NumPy (.npy para tone target) |

## Arquitectura y entrenamiento

El modelo se basa en MossFormer2_SE_48K de Alibaba, una arquitectura de mejora de voz a 48 kHz que combina mecanismos de atención lineal con bloques convolucionales para procesar espectrogramas de forma eficiente. El fine-tuning se realizó sobre grabaciones reales del servicio Hear, especializándose en el dominio de lecturas de talking newspapers. El modelo opera sobre features de 60 bandas Kaldi filter bank (ventana de 40 ms, paso de 8 ms) con sus primeras y segundas diferencias, produciendo 180 valores por frame. La entrada es un tensor de forma `(batch, 496, 180)` que representa una ventana de 4 segundos, y la salida es una máscara de forma `(batch, 496, 961)` que se multiplica sobre el espectrograma de la ventana.

El pipeline completo incluye tres etapas: primero DeepFilterNet3 como limpieza inicial, después este modelo MossFormer2 fine-tuned como segunda etapa, y finalmente un paso de tono que aplica un espectro objetivo promedio (`tone-target.npy`, 1.025 valores, uno por bin de frecuencia de una FFT de 2.048 puntos a 48 kHz) para igualar el timbre a grabaciones limpias de Hear. El modelo incluye un mecanismo de "speech guard" que detecta cuándo el modelo ha eliminado habla suave (como una "s" final) y restaura la salida de DeepFilterNet3 en esas regiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se usó RLHF o DPO.

## Capacidades

- Mejora de voz y supresión de ruido en audio a 48 kHz: elimina toses, estornudos, ladridos, portazos y ruido de fondo.
- Procesamiento por ventanas de 4 segundos con paso de 3 segundos, permitiendo limpiar grabaciones de cualquier duración.
- Generación de máscaras espectrales que se aplican sobre el espectrograma de la ventana.
- Ajuste de tono mediante un espectro objetivo promedio para igualar el timbre a grabaciones limpias.
- Mecanismo de speech guard que preserva terminaciones de palabras suaves restaurando la salida de DeepFilterNet3.
- Procesamiento multicanal: cada canal se limpia por separado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta visión, audio de entrada distinto de voz ni generación de texto.
- Capacidad multilingüe limitada: solo inglés (según la model card).

## Casos de uso

- Limpieza de grabaciones para talking newspapers: el modelo se integra en el pipeline de Hear para eliminar ruidos accidentales (toses, estornudos) de lecturas de artículos periodísticos, preservando la voz del lector gracias a su fine-tuning sobre grabaciones reales de ese dominio.
- Producción de audiolibros y podcasts: se puede usar como segunda etapa tras DeepFilterNet3 para limpiar grabaciones de narración, eliminando ruidos domésticos y de fondo sin degradar la voz, con procesamiento por ventanas de 4 segundos que permite manejar archivos largos.
- Accesibilidad auditiva: mejora de la inteligibilidad de grabaciones de voz para personas con dificultades auditivas, eliminando ruido de fondo que enmascara el habla.
- Archivado y restauración de audio: limpieza de grabaciones históricas o de baja calidad donde el ruido de fondo y los artefactos impiden su uso, con el mecanismo de speech guard que evita perder habla suave.
- Preprocesado para sistemas de reconocimiento de voz (ASR): como etapa previa a un pipeline de ASR, el modelo puede mejorar la relación señal-ruido de las grabaciones, aunque no se han publicado métricas de WER en la información disponible.
- Limpieza de reuniones y entrevistas grabadas: eliminación de ruidos ambientales (portazos, ladridos) en grabaciones de voz de una o varias personas, procesando cada canal por separado.
- Integración en pipelines de CI/CD de audio: el modelo se puede descargar en un Docker build con revisión fijada (`v1`) y verificar contra `manifest.json` con SHA-256, lo que facilita su despliegue reproducible en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección "Results" pero no se incluyen datos numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB de memoria GPU para un batch de 16 ventanas de 4 segundos.
- GPU: requiere una GPU NVIDIA como dispositivo 0; el archivo TorchScript almacena los pesos en `cuda:0` y no admite `map_location`.
- Entorno: Linux, PyTorch 2.8 con CUDA 12 y torchaudio 2.8; el modelo fue exportado con `torch 2.8.0+cu128`.
- No se indica compatibilidad con GPU de consumo (RTX 4090, etc.) en la información disponible, aunque el reducido uso de VRAM (1,2 GB para 16 ventanas) sugiere que cabría en GPUs de consumo con suficiente memoria.
- Opciones de despliegue: TorchScript (`torch.jit.load`), código de referencia en `reference/second_stage.py`, descarga vía `huggingface-cli` o URL directa, integración en Docker.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hear Magic Clean (este) | 55,3 M | 4 s (paso 3 s) | mixed-see-licences | Hugging Face, TorchScript + safetensors |
| MossFormer2_SE_48K (base) | no disponible | no disponible | no disponible | Hugging Face (alibabasglab) |
| DeepFilterNet3 | no disponible | no disponible | no disponible | Usado como primera etapa en el mismo pipeline |

No se dispone de datos de rendimiento comparativo (métricas como PESQ, STOI o SI-SDR) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia mixta ("mixed-see-licences"): requiere revisión legal antes de uso comercial; no es una licencia estándar de código abierto.
- Solo soporta inglés según la model card; no se garantiza su comportamiento en otros idiomas.
- El modelo puede eliminar habla suave (como terminaciones de palabras); por ello el pipeline incluye un speech guard que restaura la salida de DeepFilterNet3 en esas regiones, pero es un mecanismo heurístico.
- Requiere GPU NVIDIA y no admite `map_location`; no se puede ejecutar en CPU según la información disponible.
- El input debe ser WAV a 48 kHz; no se especifica soporte para otros formatos o frecuencias de muestreo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede introducir artefactos espectrales al aplicar máscaras agresivas.
- No se han publicado benchmarks ni métricas objetivas de calidad (PESQ, STOI, etc.) en la información disponible.
- El modelo está diseñado como segunda etapa tras DeepFilterNet3; usarlo de forma aislada puede dar resultados distintos a los previstos.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/samuelr3/hear-magic-clean
- Modelo base: https://huggingface.co/alibabasglab/MossFormer2_SE_48K
- Descarga directa del modelo TorchScript: https://huggingface.co/samuelr3/hear-magic-clean/resolve/v1/second-stage/mossformer2-hear-d.ts.pt
- Descarga del tone target: https://huggingface.co/samuelr3/hear-magic-clean/resolve/v1/second-stage/tone-target.npy
- Descarga de settings: https://huggingface.co/samuelr3/hear-magic-clean/resolve/v1/second-stage/settings.json

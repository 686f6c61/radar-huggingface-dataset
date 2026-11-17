# lzrhahahahaha/ReDimNet2-ONNX

## Resumen

ReDimNet2-ONNX es una conversión no oficial a formato ONNX de la familia de modelos ReDimNet2, desarrollada por el repositorio PalabraAI/redimnet2, orientada a verificación e identificación de hablante (speaker verification y speaker recognition). El modelo toma una forma de onda de audio a 16 kHz y devuelve un embedding de hablante de 192 dimensiones; dos clips se comparan mediante la similitud coseno de sus embeddings. Esta conversión permite ejecutar el modelo con ONNX Runtime en CPU o GPU sin necesidad de PyTorch.

El paquete incluye los 20 checkpoints publicados por los autores originales (versión v1.0.0), cada uno en dos precisiones: FP32 (que reproduce el modelo PyTorch original con un error relativo de ~1e-6) y FP16 (pensado para GPU, con una distancia coseno de 6e-6 respecto al original en clips de 1 segundo o más). Los grafos FP32 son entre 1,8 y 2,6 veces más rápidos que PyTorch en CPU y aproximadamente igual de rápidos en GPU; los FP16 son hasta 1,5 veces más rápidos que FP32 en clips individuales y alrededor de 2 veces más rápidos en audio largo o por lotes.

La relevancia de esta ficha radica en que ofrece una vía de despliegue ligera y portable para un sistema de verificación de hablante de tamaño muy reducido (desde 1,1M hasta 12,5M de parámetros), con el frontend de mel-espectrograma integrado en el propio grafo ONNX, lo que simplifica la integración en pipelines de producción sin dependencias de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para embeddings de hablante (ReDimNet2), con frontend de mel-espectrograma integrado en el grafo ONNX |
| Parametros totales | Desde 1,1M (B0) hasta 12,5M (B6 con datos combinados) segun checkpoint |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de audio con minimo de 720 muestras (45 ms) y ejes de batch y longitud dinamicos |
| Tipos de cuantizacion | FP32 y FP16 (dos precisiones por checkpoint) |
| Idiomas soportados | No disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 20), FP32 y FP16 |

## Arquitectura y entrenamiento

ReDimNet2 es una familia de modelos de verificación de hablante que producen embeddings de 192 dimensiones a partir de formas de onda de 16 kHz. La conversión ONNX integra el frontend de mel-espectrograma dentro del grafo, de modo que la entrada es directamente la señal de audio cruda y la salida es el vector de embedding. Los grafos usan opset 20 de ONNX y requieren ONNX Runtime 1.17 o superior (probado con 1.31.1); los ejes de batch y de longitud son dinámicos, aunque no hay máscara de padding, por lo que los clips de un mismo lote deben tener la misma longitud.

Los checkpoints se entrenaron con distintas combinaciones de datos: VoxCeleb2 en solitario, VoxBlink2 + VoxCeleb2, y VoxBlink2 + VoxCeleb2 + CN-Celeb2. Cada checkpoint existe en dos etapas: `ptn` (pretraining) y `lm` (large-margin fine-tuning), siendo esta última la recomendada por los autores. Los tamaños van de B0 a B6, con recuentos de parámetros que oscilan entre 1,1M y 12,5M. La conversión no oficial documenta en los metadatos de cada grafo la fuente, revisión, checkpoint, licencia y cambios realizados durante la conversión.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz mono.
- Verificación de hablante mediante similitud coseno entre embeddings de dos clips.
- Identificación de hablante comparando un embedding contra una galería de referencia.
- Procesamiento por lotes con ejes de batch y longitud dinámicos (sin máscara de padding; clips del mismo lote deben tener igual longitud).
- Ejecución en CPU y GPU mediante ONNX Runtime, sin dependencias de PyTorch.
- Precisión FP32 (fidelidad al modelo original) y FP16 (mayor velocidad en GPU).
- Normalización interna de la señal: admite muestras en cualquier escala.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto; es un modelo puramente de audio.

## Casos de uso

- Verificación biométrica de voz en autenticación: el modelo genera un embedding del hablante y se compara por similitud coseno contra el embedding de referencia registrado, permitiendo validar la identidad en llamadas o accesos.
- Identificación de hablante en grabaciones: se extrae el embedding de un clip y se compara contra una galería de embeddings conocidos para determinar quién habla, útil en análisis forense de audio.
- Diarización de reuniones y transcripciones: combinado con un sistema de segmentación, los embeddings permiten agrupar segmentos de audio por hablante y etiquetar quién interviene en cada momento.
- Moderación y control de acceso en plataformas de voz: verificar que el usuario que habla coincide con la cuenta registrada en chats de voz o asistentes conversacionales.
- Detección de suplantación en centros de atención telefónica: comparar la voz del interlocutor contra el perfil del cliente para detectar posibles fraudes o suplantaciones.
- Indexación y búsqueda por voz en archivos multimedia: generar embeddings de hablante para catalogar y buscar intervenciones de una persona concreta en grandes archivos de audio.
- Despliegue en dispositivos de borde: los checkpoints pequeños (B0 de 1,1M de parámetros, 5,5 MiB en FP32) permiten ejecutar la verificación en CPU sin GPU, con latencias del orden de decenas a centenares de milisegundos por clip.

## Benchmarks y rendimiento

La model card proporciona datos de rendimiento comparativo frente a PyTorch, no benchmarks de precisión (EER, accuracy) sobre conjuntos estándar.

| Metrica | Resultado |
|---|---|
| Velocidad FP32 en CPU vs PyTorch | 1,8-2,6x mas rapido |
| Velocidad FP32 en GPU vs PyTorch | Aproximadamente igual |
| Velocidad FP16 vs FP32 (clip individual) | Hasta 1,5x mas rapido |
| Velocidad FP16 vs FP32 (audio largo o lotes) | Aproximadamente 2x mas rapido |
| Diferencia FP32 vs PyTorch original | Diferencia relativa ~1e-6 |
| Distancia coseno FP16 vs original (clips >= 1 s) | <= 6e-6 |
| Reduccion de tamano FP16 vs FP32 | 21-42% menor |
| Latencia B3 cnc2 en CPU (con flush de denormales) | 106 ms por clip (vs 161 ms sin la opcion) |

No se han publicado resultados de benchmarks de precision (EER, accuracy) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; los checkpoints van de 5,5 MiB (B0 FP32) a 48,8 MiB (B6 FP32), por lo que caben en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU compatible con CUDA y cuDNN para ONNX Runtime GPU; los modelos FP16 aprovechan mejor la aceleracion en GPU.
- Cabe en GPU consumer: si, sin problema, dado el tamano reducido de los grafos.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), con paquetes `onnxruntime` o `onnxruntime-gpu`.
- Latencia y throughput: en CPU, los grafos FP32 son 1,8-2,6x mas rapidos que PyTorch; el B3 cnc2 tarda 106 ms por clip con el ajuste de denormales. En GPU, FP16 es hasta 1,5x mas rapido que FP32 en clips individuales y ~2x en audio largo o lotes.
- Ajuste recomendado en CPU: `session.set_denormal_as_zero = 1` para evitar la penalizacion de los numeros denormales en los checkpoints `cnc2` en CPUs x86.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReDimNet2-ONNX (esta ficha) | 1,1M-12,5M | Audio 16 kHz, minimo 720 muestras | MIT | ONNX (FP32/FP16) | Conversion no oficial, 20 checkpoints, sin PyTorch |
| ReDimNet2 original (PalabraAI) | 1,1M-12,5M | Audio 16 kHz | No disponible | PyTorch | Modelo original; esta conversion reproduce su comportamiento |
| ECAPA-TDNN | No disponible en la informacion | Audio | No disponible | No disponible | Modelo de referencia en verificación de hablante; sin datos comparativos en la informacion proporcionada |
| WavLM / XLS-R | No disponible en la informacion | Audio | No disponible | No disponible | Modelos de representacion de voz de mayor tamano; sin datos comparativos en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento (EER, accuracy) entre ReDimNet2 y alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: no esta mantenida por los autores originales de ReDimNet2; los metadatos de cada grafo documentan la fuente y los cambios, pero no hay garantia de soporte.
- Sin mascara de padding: los clips de un mismo lote deben tener la misma longitud; cada fila se procesa de forma independiente.
- Longitud minima de entrada: 720 muestras (45 ms); los clips de pocos segundos dan embeddings mucho mas fiables.
- Umbral de decision dependiente del checkpoint y de las condiciones de grabacion: debe calibrarse con datos propios.
- Riesgo de confusion entre hablantes con voces similares o en condiciones acusticas adversas; no se documentan tasas de error en la informacion disponible.
- Sesgos: no documentados en la informacion proporcionada; al entrenarse con VoxCeleb2, VoxBlink2 y CN-Celeb2, puede heredar sesgos de esos corpus.
- Licencia MIT: permite uso comercial, pero debe verificarse la licencia de los datos de entrenamiento originales si se redistribuye el modelo.
- Los checkpoints `cnc2` generan numeros denormales en inferencia; sin el ajuste `set_denormal_as_zero` en CPU x86 el rendimiento se degrada notablemente.
- Requiere ONNX Runtime 1.17 o superior (probado con 1.31.1); versiones anteriores pueden no soportar opset 20.

## Enlaces

- Hugging Face: https://huggingface.co/lzrhahahahaha/ReDimNet2-ONNX
- Repositorio original ReDimNet2: https://github.com/PalabraAI/redimnet2
- ONNX Runtime: https://onnxruntime.ai

# oliveryanzuolu/Relay-Forcing

## Resumen

Relay Forcing es un conjunto de checkpoints de investigación para generación de vídeo en streaming en tiempo real, publicado por el usuario oliveryanzuolu en Hugging Face. El modelo se presenta como una técnica que alcanza 1,58 NFE (evaluaciones de función por paso, es decir, pasos de evaluación de red) para la generación de vídeo en flujo continuo, un objetivo crítico para aplicaciones interactivas de vídeo. El repositorio incluye los modelos principales y una batería extensa de modelos de ablación que respaldan los resultados del artículo técnico asociado.

El modelo se construye como un fine-tune sobre dos bases distintas: Wan-AI/Wan2.2-TI2V-5B (un modelo de generación de vídeo texto-imagen-a-vídeo de 5B parámetros) y Lightricks/LTX-2.3 (un modelo de 22B parámetros). La propuesta principal es un estudiante de destilación de 4 pasos (DMD, Distribution Matching Distillation) con un cabezal de trayectoria ("trajectory head") que permite generar vídeo de forma causal y en streaming, con control de cámara. El repositorio ocupa 1,79 TB en total, lo que refleja la inclusión de múltiples semillas, ablaciones y estados de entrenamiento completos.

La relevancia actual radica en que la generación de vídeo en tiempo real con latencia baja es un problema abierto: los modelos de difusión de vídeo convencionales requieren decenas de pasos de evaluación y no son causales, lo que impide su uso en streaming. Relay Forcing propone un esquema de destilación con múltiples pasos y un cabezal que lee la historia de estados latentes para producir fotogramas de forma causal, con resultados reportados en el benchmark SANA-WM-Bench. La licencia MIT facilita su uso comercial, aunque el modelo es eminentemente de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo (DiT) con destilación DMD y cabezal de trayectoria; base Wan2.2-TI2V-5B y LTX-2.3-22B |
| Parametros totales | 5B (variante Wan2.2) y 22B (variante LTX-2.3); no disponible el desglose exacto por componente |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; ventana temporal de 15 s y 60 s en las variantes LTX-2.3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo; no aplica texto multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `model.safetensors.index.json`); configuración en `config.yaml`; estado de entrenamiento en PyTorch Distributed Checkpoint |

## Arquitectura y entrenamiento

Relay Forcing se basa en un transformer de difusión (DiT) para vídeo, sobre el que se aplica un esquema de destilación de 4 pasos con DMD (Distribution Matching Distillation) y un cabezal de trayectoria ("trajectory head") que procesa la historia de estados latentes para generar fotogramas de forma causal. El modelo principal alcanza 1,58 NFE, lo que lo sitúa en el régimen de tiempo real. Las variantes LTX-2.3-22B incorporan un decodificador VAE causal agrupado ("latent-causal grouped VAE decoder") para decodificar los latentes en vídeo, y existen versiones de 15 s y 60 s de duración de vídeo.

El entrenamiento se realizó sobre las bases Wan2.2-TI2V-5B y LTX-2.3-22B, con inicializaciones desde checkpoints intermedios (marcadas como `null` en las configuraciones). El repositorio incluye el estado completo de entrenamiento (estudiante, EMA, modelo de puntuación falso, optimizador, data loader y estados de RNG) para reanudar el entrenamiento con el mismo número de ranks: 16 ranks con 2 workers para Wan2.2-TI2V-5B, 32 ranks con 2 workers para LTX-2.3-22B de 15 s y 32 ranks sin workers para el de 60 s. Las ablaciones cubren variantes de crítico homogéneo vs. offline, estudiante causal por bloques vs. relay, historia ground truth vs. resampling, componentes del cabezal (último bloque, sin atención por pasos, sin convolución de dos tomas, capas lineales paralelas), número de pasos (1, 2, 4), pasos de GAN (ninguno, 1-4, 1-8) y escalado del cabezal (3, 5, 8 capas × 4, 8, 16 pasos desenrollados).

## Capacidades

- Generación de vídeo en streaming en tiempo real con 1,58 NFE, orientada a latencia baja.
- Generación de vídeo texto-imagen-a-vídeo (TI2V) a partir de las bases Wan2.2 y LTX-2.3.
- Control de cámara (camera control) en la generación de vídeo.
- Modelo del mundo ("world-model") para simulación visual causal.
- Generación de vídeo de 15 s y 60 s de duración en las variantes LTX-2.3-22B.
- Decodificación latente causal mediante VAE agrupado para las variantes LTX-2.3.
- No se documentan capacidades de tool calling, agentes, razonamiento textual ni multilingüismo, al ser un modelo de vídeo.

## Casos de uso

- Generación de vídeo interactivo en tiempo real: el modelo puede producir fotogramas de forma causal con 1,58 NFE, lo que permite aplicaciones de streaming donde el usuario ve el vídeo generarse mientras interactúa, gracias a la naturaleza causal del cabezal de trayectoria.
- Control de cámara en producción virtual: la capacidad de camera control permite generar tomas con movimientos de cámara especificados, útil en previsualización de planos y animática para cine y publicidad.
- Simulación de entornos para robótica y conducción: como world-model, puede generar secuencias visuales causalmente coherentes para entrenar o evaluar políticas en entornos simulados, aprovechando la ventana de 15 s o 60 s de las variantes LTX-2.3.
- Prototipado rápido de vídeo para redes sociales: la generación en streaming con latencia baja permite crear clips cortos a partir de una imagen o texto de entrada, adecuado para iteración rápida de contenido.
- Investigación en destilación de modelos de difusión: el repositorio incluye 24 modelos de ablación y estados de entrenamiento completos, lo que lo convierte en un banco de pruebas para estudiar DMD, críticos homogéneos vs. offline y escalado de cabezales.
- Evaluación comparativa en SANA-WM-Bench: los checkpoints están etiquetados con las tablas y figuras del artículo en las que se usan, lo que facilita reproducir los resultados del benchmark y comparar variantes.
- Generación de vídeo de larga duración: la variante LTX-2.3-22B de 60 s permite crear secuencias de un minuto con coherencia causal, útil para demos y contenido narrativo breve.

## Benchmarks y rendimiento

Los resultados se reportan en el benchmark SANA-WM-Bench según la model card, pero no se proporcionan los valores numéricos en la información disponible. La model card indica qué tablas y figuras del artículo usan cada checkpoint (Tabla 1, Tabla 2, Tabla 3, Tabla 4, Tabla 5, Tabla 6, Figura 4, Figura 5, Figura 6, Figura 7), pero no incluye las cifras.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 5B en precisión completa requiere del orden de 10-20 GB solo para pesos, y un modelo de 22B del orden de 44-88 GB, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. El estado de entrenamiento indica 16 ranks para Wan2.2-TI2V-5B y 32 ranks para LTX-2.3-22B, lo que sugiere entrenamiento multi-GPU, pero no se especifican modelos de GPU.
- ¿Cabe en GPU consumer? No disponible. El tamaño del repositorio (1,79 TB) y la naturaleza de los checkpoints (EMA + estado de entrenamiento) hacen inviable su uso directo en consumer sin seleccionar únicamente los pesos EMA.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga se realiza vía `huggingface_hub.snapshot_download` y safetensors, con configuración en `config.yaml`.
- Latencia y throughput: el modelo principal se describe como "real-time" a 1,58 NFE, pero no se proporcionan medidas de latencia (ms/fotograma) ni throughput (fps) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/duración | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Relay Forcing (Wan2.2-TI2V-5B) | 5B | no disponible | Destilación DMD 4 pasos, streaming causal | MIT | Hugging Face |
| Relay Forcing (LTX-2.3-22B) | 22B | 15 s / 60 s | Destilación DMD 4 pasos, streaming causal | MIT | Hugging Face |
| Wan2.2-TI2V-5B (base) | 5B | no disponible | Difusión de vídeo TI2V estándar | no disponible en la información | Hugging Face |
| LTX-2.3 (base) | 22B | no disponible | Difusión de vídeo | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo (SANA-WM-Bench u otros) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de investigación: los checkpoints están pensados para reproducir resultados de un artículo, no como producto listo para producción.
- Repositorio de 1,79 TB: incluye estados de entrenamiento y ablaciones; descargar el repositorio completo es inviable en la mayoría de entornos, por lo que debe seleccionarse la carpeta concreta.
- Reanudación del entrenamiento restringida: requiere el mismo número de ranks y workers por rank que en el entrenamiento original (16/32 ranks según variante), lo que limita la reproducibilidad en hardware distinto.
- Idiomas: no se documentan capacidades multilingües; es un modelo de vídeo, no de texto.
- Sesgos y alucinación visual: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; como modelo generativo de vídeo, existe riesgo de artefactos y contenido no fiel a la entrada.
- Licencia MIT: permite uso comercial, pero al derivar de Wan2.2-TI2V-5B y LTX-2.3, deben respetarse las licencias de las bases (no detalladas en la información disponible).
- Sin datos de benchmarks numéricos ni de latencia/throughput publicados en la información disponible, lo que impide validar las afirmaciones de tiempo real de forma independiente.
- El pipeline no está disponible en Hugging Face, lo que puede complicar la integración con herramientas estándar.

## Enlaces

- Hugging Face: https://huggingface.co/oliveryanzuolu/Relay-Forcing
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo base LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- No se han encontrado en la información proporcionada enlaces a paper, blog, repositorio de código o demo.

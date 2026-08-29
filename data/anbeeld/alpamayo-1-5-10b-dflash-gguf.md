# Anbeeld/Alpamayo-1.5-10B-DFlash-GGUF

## Resumen

Alpamayo-1.5-10B-DFlash-GGUF es una cuantización GGUF del modelo draft DFlash, desarrollado por el laboratorio z-lab, que se utiliza para acelerar la inferencia del modelo de visión-lenguaje-acción (VLA) Alpamayo 1.5 10B de NVIDIA mediante decodificación especulativa. Este draft model emplea una técnica de difusión por bloques (block-diffusion) para proponer varios tokens en paralelo, que luego son verificados por el modelo principal en una sola pasada, preservando la distribución de salida. El repositorio, publicado por Anbeeld, ofrece pesos cuantizados listos para usar con BeeLlama.cpp, un fork de llama.cpp con características avanzadas de cuantización.

Este modelo no es un modelo de lenguaje independiente: actúa como un componente acelerador dentro del pipeline FlashDrive, orientado a tareas de conducción autónoma y robótica. Su relevancia radica en que permite reducir la latencia de razonamiento de modelos VLA de 10B en entornos con recursos limitados, manteniendo la calidad de las predicciones. La arquitectura es una red estilo Qwen3 de 2 capas con un tamaño de bloque de 8, condicionada a los estados ocultos de las capas 24, 30, 31, 32 y 34 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red Qwen3-style de 2 capas, block-diffusion draft (bloque de tamaño 8) |
| Parametros totales | 469.787.136 (~470M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones; no se especifican los tipos exactos en el repositorio) |
| Idiomas soportados | no disponible (etiqueta 'en' presente en el repositorio) |
| Licencia | NVIDIA License (uso no comercial exclusivamente, aplicable a derivados) |
| Formato de pesos | GGUF (el repositorio también incluye safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo DFlash es un draft model diseñado para decodificación especulativa. Su arquitectura consiste en una red ligera de 2 capas inspirada en Qwen3, que procesa bloques de 8 tokens en paralelo. Se condiciona en los estados ocultos de las capas 24, 30, 31, 32 y 34 del modelo base Alpamayo 1.5 10B, lo que le permite predecir secuencias de tokens que luego son verificadas por el modelo principal en una única pasada. Esta técnica, denominada block-diffusion, reduce la latencia de inferencia al proponer múltiples tokens simultáneamente sin degradar la distribución de salida.

El entrenamiento del draft model se llevó a cabo como parte del proyecto FlashDrive, que integra el razonamiento de cadena de causalidad (chain-of-causation) con trayectorias de conducción. Los detalles del entrenamiento (número de tokens, dataset, método de alineación) no se especifican en la información disponible. El modelo base Alpamayo 1.5 10B es un modelo VLA de NVIDIA con razonamiento reforzado, orientado a vehículos autónomos, que combina comprensión visual, navegación y respuesta a preguntas visuales.

## Capacidades

- Aceleración de inferencia: propone hasta 8 tokens por bloque mediante decodificación especulativa, reduciendo la latencia del modelo base.
- Compatibilidad con FlashDrive: se integra automáticamente con el pipeline de inferencia de FlashDrive para conducción autónoma.
- Preservación de la distribución de salida: la verificación en una sola pasada garantiza que las predicciones finales coincidan con las del modelo base.
- No es un modelo conversacional: no genera texto ni responde preguntas por sí mismo; requiere el modelo base Alpamayo 1.5 10B.
- Soporte de cuantización GGUF: permite ejecución en CPU y GPU con menor consumo de memoria mediante BeeLlama.cpp.
- Incluye mask_embedding.pt: un embedding de máscara entrenado que FlashDrive añade a la tabla de embeddings del modelo base.

## Casos de uso

- Conducción autónoma en tiempo real: el modelo acelera el razonamiento de cadena de causalidad de Alpamayo 1.5, permitiendo tomar decisiones de navegación con menor latencia en vehículos con recursos computacionales limitados.
- Simulación de escenarios de tráfico: al reducir el tiempo de inferencia, facilita la generación de múltiples trayectorias hipotéticas en simuladores para evaluación de seguridad.
- Robótica móvil: el pipeline FlashDrive puede adaptarse a robots terrestres que necesitan integrar percepción visual y planificación de acciones con restricciones de tiempo real.
- Investigación en decodificación especulativa: sirve como referencia para estudiar técnicas de block-diffusion y su aplicación a modelos VLA de gran tamaño.
- Despliegue en edge computing: las cuantizaciones GGUF permiten ejecutar el draft model en dispositivos con poca memoria (por ejemplo, Jetson) junto al modelo base cuantizado.
- Evaluación de latencia en pipelines VLA: los desarrolladores pueden medir el impacto del draft model en el throughput y la calidad de las predicciones antes de integrarlo en sistemas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de latencia, throughput ni comparaciones con otros draft models. Se recomienda consultar el paper de DFlash (arXiv:2602.06036) para datos experimentales, aunque no están accesibles en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~470M parámetros en formato GGUF, requiere aproximadamente 1-2 GB de VRAM en cuantizaciones de 8 bits, dependiendo de la variante elegida. Sin embargo, al ejecutarse junto al modelo base de 10B, los requisitos totales están dominados por este último.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el draft model junto con el modelo base cuantizado (por ejemplo, RTX 3060, RTX 4070). Para el modelo base completo se recomiendan GPUs de 24 GB o más (A100, RTX 4090).
- Compatibilidad con consumer GPU: sí, gracias a las cuantizaciones GGUF y al fork BeeLlama.cpp, es posible ejecutar en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: BeeLlama.cpp (fork de llama.cpp), también se puede integrar con el pipeline FlashDrive de z-lab (código bajo licencia MIT).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de información sobre modelos draft comparables en la documentación proporcionada. El ecosistema de decodificación especulativa incluye alternativas como EAGLE, Medusa o Lookahead, pero no hay datos de comparación directa con DFlash en este repositorio. Se recomienda consultar el paper de DFlash para una comparativa técnica.

## Limitaciones y advertencias

- Licencia no comercial: el modelo se rige por la NVIDIA License, que restringe el uso a fines no comerciales y se extiende a obras derivadas. No apto para producción comercial sin autorización expresa.
- No es un modelo independiente: no puede generar texto ni realizar tareas de razonamiento por sí solo; requiere el modelo base Alpamayo 1.5 10B y el pipeline FlashDrive.
- Dependencia de capas específicas: el draft model está condicionado a capas concretas del modelo base; cualquier modificación del modelo base puede invalidar el draft.
- Riesgo de alucinación y sesgos: al ser un componente de aceleración, no introduce sesgos propios, pero hereda los del modelo base. No hay evaluación de sesgos publicada.
- Documentación limitada: no se especifican los tipos de cuantización GGUF incluidos ni los idiomas soportados, lo que dificulta la selección de la variante adecuada.
- Compatibilidad restringida: requiere BeeLlama.cpp (fork específico) para aprovechar las cuantizaciones avanzadas; no es compatible con llama.cpp estándar ni con otras herramientas de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Anbeeld/Alpamayo-1.5-10B-DFlash-GGUF
- Modelo base (z-lab): https://huggingface.co/z-lab/Alpamayo-1.5-10B-DFlash
- Modelo original NVIDIA: https://huggingface.co/nvidia/Alpamayo-1.5-10B
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Repositorio FlashDrive: https://github.com/z-lab/flashdrive
- Blog FlashDrive: https://z-lab.ai/projects/flashdrive/
- Repositorio BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- Colección de modelos FlashDrive: https://huggingface.co/collections/z-lab/flashdrive

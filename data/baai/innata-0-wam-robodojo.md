# BAAI/Innata-0-WAM-RoboDojo

## Resumen

Innata-0-WAM-RoboDojo es un modelo de acción en el mundo (world action model, WAM) desarrollado por BAAI (Beijing Academy of Artificial Intelligence) para RoboDojo-Sim, un entorno de simulación orientado a robótica. El checkpoint publicado corresponde a los pesos EMA del paso 24.000 de una política H5 con acciones Joint14, exportados a Hugging Face en formato safetensors con código personalizado. Su arquitectura se describe como de tres torres (three-tower), un diseño que separa componentes de percepción, dinámica del mundo y generación de acciones.

El modelo no es un LLM conversacional sino una política de control robótico entrenada en simulación, por lo que su relevancia se enmarca en la investigación de manipulación robótica y aprendizaje por imitación o refuerzo dentro de RoboDojo-Sim. Con 16.182.057.152 parámetros (aproximadamente 16,2 mil millones) y un repositorio de 32,4 GB, es un modelo de gran tamaño para su categoría, lo que condiciona fuertemente los requisitos de hardware para inferencia.

La información pública disponible es muy limitada: la model card remite al repositorio de inferencia de Innata para los comandos de evaluación, y no se detallan licencia, idiomas, contexto ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables y marca explícitamente como no disponible todo aquello que no aparece en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Three-tower world action model (WAM) con código personalizado (`cosmos3_omni`) |
| Parametros totales | 16.182.057.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "three-tower world action model" para RoboDojo-Sim. La etiqueta `cosmos3_omni` en Hugging Face sugiere una base relacionada con la familia Cosmos de modelos de mundo, aunque no se detalla en la información disponible cómo se combinan las tres torres ni qué función cumple cada una. El checkpoint publicado son los pesos EMA del paso 24.000 de la política H5 con acciones Joint14, lo que indica un entrenamiento prolongado con media móvil exponencial de pesos, práctica habitual para estabilizar políticas de control.

No se especifican el número de tokens o trayectorias de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por imitación. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible a partir de la documentación publicada.

## Capacidades

- Generación de acciones de control robótico en el entorno RoboDojo-Sim, con un espacio de acción Joint14.
- Modelado de mundo: la arquitectura de tres torres sugiere componentes de predicción de dinámica además de la política de acción, aunque su funcionamiento exacto no está documentado.
- Evaluación en simulación mediante el repositorio de inferencia de Innata.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en manipulación robótica simulada: el modelo puede emplearse como política de referencia en RoboDojo-Sim para tareas con acciones Joint14, sirviendo de base para comparar nuevos algoritmos de aprendizaje por imitación o refuerzo.
- Evaluación de políticas de control: al ser un checkpoint EMA del paso 24.000, es adecuado para reproducir resultados de evaluación en el entorno de simulación siguiendo los comandos del repositorio de inferencia de Innata.
- Modelado de dinámica del mundo: la componente de world model puede usarse para predecir la evolución del entorno y planificar acciones a corto plazo en simulación.
- Generación de datos sintéticos de trayectorias: las políticas entrenadas en simulación pueden generar rollouts que alimenten pipelines de entrenamiento posteriores.
- Punto de partida para fine-tuning: investigadores pueden adaptar los pesos a variantes de RoboDojo-Sim o a espacios de acción relacionados, aunque el coste computacional de un modelo de 16,2 mil millones de parámetros es elevado.
- Estudio de estabilidad de entrenamiento: los pesos EMA permiten analizar el efecto de la media móvil exponencial en la calidad de la política frente a checkpoints no promediados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16,18 mil millones de parámetros en precisión completa (fp32) se necesitan aproximadamente 64,7 GB solo para pesos; en bf16/fp16, unos 32,4 GB; en cuantización de 8 bits, unos 16,2 GB; en 4 bits, unos 8,1 GB. Estas estimaciones no incluyen activaciones ni memoria del entorno de simulación.
- GPU recomendadas: para bf16 se requiere al menos una A100 de 40 GB o una H100; para fp32, una A100 de 80 GB o varias GPU con paralelismo.
- Cabe en GPU de consumo: en 4 bits podría ajustarse en una RTX 4090 de 24 GB, pero las activaciones y el simulador pueden exceder esa memoria; en bf16 no cabe en GPU de consumo actuales.
- Opciones de despliegue: el modelo usa `custom_code` y remite al repositorio de inferencia de Innata; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world action models para robótica en simulación) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero la política puede generar acciones no válidas o inseguras fuera del dominio de RoboDojo-Sim.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia para uso comercial: la licencia no está especificada, por lo que no puede asumirse uso comercial sin consultar al autor.
- El modelo está entrenado específicamente para RoboDojo-Sim con acciones Joint14; su transferencia a otros entornos o morfologías no está documentada.
- Requiere código personalizado (`custom_code`) y el repositorio de inferencia de Innata; no es desplegable con herramientas estándar sin adaptación.
- El tamaño de 16,2 mil millones de parámetros y un repositorio de 32,4 GB implican costes de almacenamiento y cómputo considerables.
- Al ser un checkpoint intermedio (paso 24.000), no necesariamente representa el mejor rendimiento de la familia.

## Enlaces

- Hugging Face: https://huggingface.co/BAAI/Innata-0-WAM-RoboDojo
- Repositorio de inferencia de Innata: https://github.com/baai-eai/innata-framework-inference#release-checkpoint-inference

# aabyaneh/cawm

## Resumen

CAWM (acrónimo no expandido en la información disponible) es un modelo de mundo (*world model*) orientado a robótica, publicado en HuggingFace por el usuario `aabyaneh` bajo licencia MIT. El modelo incorpora capacidades táctiles (*tactile*) y utiliza un esquema de difusión, según los tags del repositorio. Está etiquetado con el pipeline `robotics`, lo que lo sitúa en la categoría de modelos diseñados para simular dinámicas del entorno físico y apoyar tareas de planificación o control robótico.

El repositorio tiene un tamaño de 74,2 GB, lo que sugiere pesos de gran magnitud, probablemente un modelo de difusión con un backbone de parámetros elevados o múltiples componentes (codificadores, decodificadores, módulos táctiles). La fecha de creación es el 5 de agosto de 2026 y la última actualización el 4 de noviembre de 2026.

El acceso está restringido (*gated*): es necesario aceptar condiciones en HuggingFace para descargar los pesos. No se han publicado descargas ni *likes*, y no hay información pública sobre arquitectura detallada, número de parámetros, contexto o idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como *world model* con difusión y componente táctil) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (tamaño del repo: 74,2 GB) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna. Los tags del repositorio indican `world-model`, `tactile`, `diffusion` y `robotics`. Esto sugiere un modelo generativo basado en difusión que modela la dinámica del entorno (posiblemente estados futuros o trayectorias) e incorpora señales táctiles como modalidad adicional. No se especifica si el backbone es un transformer, un U-Net o una arquitectura híbrida, ni si hay módulos de atención lineal o decodificación especulativa.

Tampoco se han publicado datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de datos táctiles frente a visuales o proprioceptivos), ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. El tamaño del repositorio (74,2 GB) es el único indicador cuantitativo disponible y sugiere pesos en precisión alta (posiblemente fp32 o fp16) sin cuantizaciones publicadas.

## Capacidades

- Modelado de dinámicas físicas para robótica: el tag `world-model` indica que el modelo aprende a predecir la evolución del entorno, útil para planificación y simulación.
- Procesamiento de señales táctiles: el tag `tactile` sugiere que el modelo incorpora información de sensores de contacto, relevante para manipulación fina.
- Generación mediante difusión: el tag `diffusion` apunta a un proceso generativo iterativo, típico en modelos de mundo que producen trayectorias o estados futuros.
- Integración en pipelines de robótica: el pipeline declarado es `robotics`, lo que indica compatibilidad con flujos de trabajo de control y percepción.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, modo *thinking*): no disponible.

## Casos de uso

- Simulación de manipulación táctil: el modelo puede emplearse para predecir la respuesta de un objeto ante fuerzas de contacto, lo que permite entrenar políticas de agarre en simulación antes de transferirlas a un robot real. Su componente táctil lo hace adecuado para tareas donde la señal visual es insuficiente (por ejemplo, objetos ocluidos).
- Planificación basada en modelo (*model-based planning*): al ser un *world model*, puede generar rollouts de estados futuros para evaluar acciones candidatas sin ejecutarlas en el robot físico, reduciendo el desgaste y el riesgo.
- Aumento de datos para entrenamiento de políticas: las muestras generadas por difusión pueden ampliar datasets de robótica escasos, especialmente en escenarios de contacto que son difíciles de registrar a gran escala.
- Control predictivo en entornos dinámicos: el modelo puede integrarse en bucles de control para anticipar la evolución del entorno y ajustar la acción con antelación, útil en tareas de ensamblaje o manipulación rápida.
- Investigación en representaciones multimodalidad visión-tacto: sirve como banco de pruebas para estudiar cómo se fusionan señales táctiles y visuales en un modelo generativo, dado que combina ambos tags.
- Prototipado en laboratorio con licencia permisiva: al ser MIT, un grupo de investigación puede modificarlo y redistribuirlo sin restricciones de uso comercial, lo que facilita su adopción en proyectos académicos y spin-offs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El tamaño del repositorio (74,2 GB) sugiere que los pesos completos en fp16 o fp32 requieren al menos 74 GB de memoria, lo que excede una única GPU consumer y apunta a GPUs de centro de datos (A100 80 GB, H100 80 GB) o a despliegue multi-GPU.
- GPU recomendadas: no confirmadas por el autor. Por tamaño, se necesitarían A100 80 GB, H100 80 GB o configuraciones con múltiples RTX 4090 (24 GB cada una) si se aplican cuantizaciones, que no están publicadas.
- ¿Cabe en GPU consumer?: no de forma directa con los pesos completos. Sería necesario cuantizar, pero no se ofrecen variantes GGUF, AWQ ni GPTQ en la información disponible.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; para difusión sería más habitual usar Diffusers, pero no se confirma).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models táctiles para robótica) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es *gated*; es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede retrasar la evaluación.
- Falta de documentación: no hay información pública sobre arquitectura, parámetros, contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Sin benchmarks: no se han publicado métricas que permitan comparar su rendimiento con alternativas, por lo que su calidad es desconocida.
- Tamaño elevado: 74,2 GB de pesos implican requisitos de hardware considerables y costes de inferencia altos.
- Riesgo de alucinación física: como modelo generativo de dinámicas, puede producir rollouts plausibles pero incorrectos, lo que en robótica real puede provocar acciones inseguras si se usa sin validación.
- Sesgos: no disponibles; no se documenta la composición del dataset ni posibles sesgos en la distribución de tareas.
- Idiomas: no se declaran idiomas soportados; si el modelo incluye instrucciones en lenguaje natural, no se especifica cuáles.
- Licencia MIT: permisiva para uso comercial, pero al no haber documentación sobre patentes o dependencias de terceros, conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- Sin cuantizaciones publicadas: no hay variantes ligeras, lo que limita el despliegue en hardware modesto.

## Enlaces

- HuggingFace: https://huggingface.co/aabyaneh/cawm
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

# rizkypratama/project-contrastive13

## Resumen

`rizkypratama/project-contrastive13` es un prototipo de investigación publicado en HuggingFace por el usuario rizkypratama. Se trata de una implementación propia de una arquitectura híbrida CNN-Transformer orientada a aprendizaje contrastivo, etiquetada por el propio autor como escala "tiny". El repositorio contiene código Python ejecutable, un `config.json` con la configuración de arquitectura, un `training_args.json` con la receta de experimento por defecto y un checkpoint de inicialización en `model.safetensors`.

El dato más relevante para evaluarlo es su tamaño real: 16.576 parámetros según el fichero safetensors, con un tamaño de repositorio de 0,0 GB. No es un modelo entrenado ni un checkpoint con pesos útiles para inferencia real; el propio autor indica explícitamente en la model card que el checkpoint es "una inicialización válida para smoke tests" y que "no se presenta como un checkpoint entrenado con benchmarks". Por tanto, no debe confundirse con un modelo de lenguaje desplegable.

Su relevancia actual es exclusivamente como material de investigación y como andamiaje reproducible: documenta una receta de entrenamiento (SGD con scheduler de tipo step), una configuración de arquitectura concreta (atención dilatada, fusión por co-attention, activación approx GELU, normalización InstanceNorm) y un script de evaluación. Es útil para quien quiera comparar variantes de fusión CNN-Transformer en tareas contrastivas, no para aplicaciones de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN Transformer (híbrida convolucional-transformer), atención dilatada, fusión co-attention |
| Parámetros totales | 16.576 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica safetensors; no hay variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no se declara corpus ni cobertura lingüística) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Escala declarada | tiny |
| Activación | approx GELU |
| Normalización | InstanceNorm |
| Optimizador por defecto | SGD con scheduler step |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-27 |

## Arquitectura y entrenamiento

La arquitectura es una CNN Transformer, es decir, un híbrido que combina extractores convolucionales con capas de atención. Según la tabla de la model card, emplea atención dilatada (dilated attention), mecanismo de fusión mediante co-attention, activación approx GELU y normalización InstanceNorm. El diseño está orientado a tareas de aprendizaje contrastivo, un régimen de entrenamiento en el que el objetivo es acercar representaciones de pares positivos y alejar las de pares negativos, lo que encaja con el uso de co-attention para fusionar dos ramas de entrada. No se especifica el número de capas, dimensiones ocultas, número de cabezas ni resolución de entrada.

En cuanto al entrenamiento, la receta por defecto usa SGD con un scheduler de tipo step. El autor advierte de forma explícita que estos son "valores de partida en el script, no evidencia de una ejecución completada". El repositorio no documenta número de tokens, composición del dataset, ni etapas de RLHF, DPO o ajuste por preferencias. Tampoco se declara ninguna innovación técnica verificada más allá de la combinación arquitectónica (convoluciones + atención dilatada + co-attention) en un contexto contrastivo.

## Capacidades

- No hay evidencias de capacidades entrenadas: el checkpoint publicado es una inicialización sin entrenar, por lo que no se puede afirmar que genere texto, código, matemáticas o razonamiento.
- Arquitectura preparada para aprendizaje contrastivo: el código está orientado a producir representaciones de similitud entre pares, no a generación autorregresiva.
- Instanciación y ejecución de smoke tests: permite verificar que la implementación se instancia, carga pesos y ejecuta un forward pass sin errores.
- Evaluación de variantes arquitectónicas: sirve como base editable para experimentar con atención dilatada, co-attention y normalización InstanceNorm.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe.
- No se documenta ningún modo especial (thinking mode, visión, audio, decodificación especulativa).
- Carga mediante APIs genéricas: requiere un adaptador explícito, ya que es una implementación personalizada.

## Casos de uso

- Smoke test de pipelines de entrenamiento: el script `eval.py` y el checkpoint de inicialización permiten comprobar que un pipeline de entrenamiento o evaluación arranca correctamente antes de lanzar un run costoso, sin consumir recursos de GPU relevantes.
- Ablación de módulos de fusión: al ser un prototipo pequeño, permite sustituir la co-attention por concatenación, suma o cross-attention y medir el efecto en una tarea contrastiva concreta con un coste computacional mínimo.
- Comparación de esquemas de atención: la atención dilatada de la configuración por defecto puede contrastarse con atención densa manteniendo el resto de hiperparámetros fijos, útil para estudiar el compromiso entre campo receptivo y coste.
- Estudio de normalización en híbridos CNN-Transformer: InstanceNorm no es la elección habitual en transformers (lo típico es LayerNorm o RMSNorm), por lo que este repositorio sirve para evaluar empíricamente esa decisión en tareas contrastivas.
- Prueba de integración de adaptadores de carga: dado que las APIs genéricas no pueden cargar esta arquitectura sin un adaptador explícito, el repositorio es útil para validar el desarrollo de dicho adaptador dentro de una librería propia.
- Material docente y de reproducción: sirve como ejemplo mínimo y legible de cómo se estructura un repositorio de investigación en HuggingFace (config, training args, script de evaluación, checkpoint de init) para cursos o talleres de reproducibilidad.
- Definición de protocolo de evaluación: la model card propone un protocolo concreto (conjunto de validación específico de tarea, métrica reportada en al menos tres semillas, baseline de capacidad equiparable) que puede reutilizarse como plantilla metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara de forma explícita que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint "no se presenta como un checkpoint entrenado con benchmarks". Tampoco la búsqueda web devuelve métricas asociadas a este identificador de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Con 16.576 parámetros, el checkpoint ocupa del orden de decenas de kilobytes en fp32, por lo que el modelo completo cabe en cualquier memoria disponible.
- GPU recomendadas: ninguna en particular. El modelo es ejecutable en CPU sin optimizaciones específicas; cualquier GPU, incluida una integrada, es sobredimensionada para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en dispositivos embebidos tipo Raspberry Pi.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia estándar. Al ser una arquitectura personalizada (CNN Transformer con co-attention), requiere el script propio del repositorio o un adaptador explícito para cualquier framework externo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y, al no existir un checkpoint entrenado, carecerían de significado para una tarea real.
- Nota de producción: dado que los pesos son una inicialización aleatoria no entrenada, cualquier despliegue en producción produciría salidas sin valor predictivo.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de forma fiable. Se trata de un prototipo de investigación de 16.576 parámetros, sin entrenamiento completado y sin benchmarks publicados, por lo que una comparación con modelos de la misma categoría (híbridos CNN-Transformer para aprendizaje contrastivo) requeriría localizar las implementaciones concretas con las que se quiere contrastar y verificar sus métricas en la misma tarea, dato que no consta en este repositorio. Las búsquedas web realizadas devuelven agregadores genéricos de benchmarks y páginas no relacionadas, sin resultados atribuibles a este modelo.

## Limitaciones y advertencias

- Checkpoint sin entrenar: los pesos de `model.safetensors` son una inicialización, no un modelo útil. Cualquier inferencia producirá resultados aleatorios.
- Sin evaluación de robustez, equidad ni transferencia de dominio: el autor indica explícitamente que el checkpoint no ha sido auditado en ninguno de estos ejes.
- Sin benchmarks ni métricas publicadas: no existe evidencia empírica de rendimiento, ni siquiera preliminar.
- Idiomas no declarados: no hay información sobre cobertura lingüística ni sobre el corpus empleado.
- Longitud de contexto desconocida: `config.json` no ha sido expuesto en la información disponible, por lo que no se puede determinar la ventana de entrada ni la resolución esperada.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. No obstante, el autor advierte de que deben revisarse por separado los términos de los datos de origen si se combina con datasets externos.
- Riesgo de sesgo: no evaluable, al no existir entrenamiento ni dataset documentado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, ya que no hay un modelo generativo entrenado; el riesgo real es interpretar este repositorio como un modelo funcional.
- Advertencia para producción: no debe desplegarse en ningún sistema de producción. Su uso adecuado es como punto de partida experimental.
- Advertencia metodológica del propio autor: cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto publicados aquí, y toda comparación debe realizarse con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rizkypratama/project-contrastive13
- Sitio personal del autor (no confirmado como correspondiente al mismo rizkypratama): https://rizkyp.com/
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos asociados específicamente a este modelo. Los resultados devueltos (benchlm.ai, aimodelsbenchmark.com, perfiles de HuggingFace de otros usuarios y TikTok) no guardan relación con `project-contrastive13`.

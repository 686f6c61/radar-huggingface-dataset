# blueprint-ai-hq-main/glassnet-math-tiny

## Resumen

GlassNet math1 es un modelo aritmético minúsculo entrenado desde cero por el autor `blueprint-ai-hq-main` para resolver sumas de dos dígitos escribiendo el razonamiento paso a paso antes del resultado. No es un modelo de lenguaje: no procesa preguntas en lenguaje natural, sino que lee dos operandos y emite una traza de dígitos y acarreos en orden de menor a mayor peso, replicando el algoritmo de suma por columnas. Con 9.084 parámetros y un contexto de 15 tokens, su interés no reside en la capacidad bruta sino en la verificabilidad del razonamiento: al producir la explicación como tokens de salida, un paso erróneo fuerza un resultado erróneo, lo que permite auditar el cálculo.

El modelo se distribuye en varios formatos (safetensors, GGUF, JSON con pesos en base64) e incluye un contenedor de cuatro operadores (`mathall.glassnet`) cuya precisión no es verificable a partir de los metadatos. La model card documenta explícitamente un episodio de corrección: una versión anterior afirmaba 67.484 parámetros y 100% de precisión sobre un archivo que en realidad era un stub de 9.212 parámetros con 0% de acierto, lo que da una idea del nivel de rigor (y de las cautelas) con que debe leerse la información publicada.

Es relevante ahora como ejemplo de modelo interpretable de escala extrema, útil para estudiar mecánicas de razonamiento verificable y para experimentos educativos sobre entrenamiento desde cero, más que como componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (motor propio, sin pesos preentrenados; transformer no confirmado) |
| Parametros totales | 9.084 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 15 tokens |
| Tipos de cuantizacion | no disponible (se distribuye GGUF, pero no se documentan niveles de cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; vocabulario de 23 tokens) |
| Licencia | MIT |
| Formato de pesos | safetensors (`math1.safetensors`, 15 tensores, 37.728 bytes), GGUF (`math1.gguf`, 37.529 bytes), JSON base64 (`math1_weights.json`), contenedor propietario `mathall.glassnet` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que se entrenó desde cero con "motor propio, gradientes propios y optimizador propio", sin pesos preentrenados ni código de entrenamiento externo. El archivo safetensors contiene 15 tensores, lo que sugiere una red de pequeña profundidad, pero no se especifica si es un transformer, un MLP u otra topología. El vocabulario es de 23 tokens y el contexto de 15, coherente con la tarea: dos operandos de dos dígitos más la traza de dígitos y acarreos.

El entrenamiento consta de 8.000 pasos sobre la tarea de suma de dos dígitos. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO o algún tipo de ajuste posterior. La innovación destacable es el mecanismo de verificación en exportación: el script `lens/math_app.py` re-puntúa 300 problemas nuevos antes de exportar y se niega a exportar si la traza escrita no reconstruye la aritmética real, comprobación que se valida primero sobre 400 trazas generadas. Según la model card, el modelo alcanza 100,0% de acierto en 300 problemas no vistos en entrenamiento.

## Capacidades

- Suma de dos dígitos con acarreo, con precisión reportada del 100,0% en 300 problemas retenidos.
- Generación de traza de razonamiento explícita (pares dígito-acarreo, de menor a mayor peso) antes del resultado.
- Razonamiento verificable: la explicación se emite como tokens de salida, no se genera a posteriori.
- Exportación a safetensors, GGUF y JSON base64 para aplicaciones de navegador o APK.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso fuera de la traza aritmética descrita.
- No tiene capacidades multilingües ni de lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Demostración educativa de razonamiento verificable: el modelo escribe la suma por columnas como un humano, lo que permite mostrar en un aula cómo un paso intermedio erróneo conduce a un resultado erróneo y por qué eso hace auditable el cálculo.
- Prueba de concepto de entrenamiento desde cero: con 9.084 parámetros y 8.000 pasos, sirve para reproducir un pipeline completo (entrenamiento, evaluación retenida, exportación verificada) en hardware mínimo.
- Validación de pipelines de exportación: el mecanismo que re-puntúa 300 problemas y rechaza la exportación si la traza no reconstruye la aritmética es un patrón reutilizable en proyectos que necesitan garantías antes de publicar pesos.
- Aplicación de escritorio o móvil offline: el archivo JSON base64 (pesos de ~37 KB) permite incrustar el modelo en una app de navegador o APK sin dependencias de servidor.
- Benchmark de juguete para comparar motores de inferencia: al ser un GGUF de 37.529 bytes, permite medir latencia y sobrecarga de arranque de herramientas como llama.cpp con un modelo trivial.
- Estudio de mecánicas de acarreo en redes pequeñas: la traza dígito-acarreo ofrece un conjunto de datos interpretable para analizar cómo una red de 15 tensores representa el estado de acarreo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Suma de dos dígitos (held-out) | 100,0% (300/300) | Problemas no vistos en entrenamiento, según la model card |
| Suma de cuatro dígitos (held-out) | 100,0% (420/500) | Ejecución con acarreos; no se guardaron pesos, no descargable |
| Contenedor `mathall.glassnet` (cuatro operadores) | no verificable | La model card indica que su precisión no es verificable solo con los metadatos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es un modelo de lenguaje y no aplica a esas evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (37.728 bytes en safetensors, 37.529 bytes en GGUF); el cuello de botella es el runtime, no el modelo.
- GPU recomendadas: no aplica; cualquier GPU, CPU o incluso entorno embebido es suficiente.
- Cabe en cualquier GPU de consumo, incluida una iGPU o un microcontrolador con memoria suficiente para el runtime.
- Opciones de despliegue: llama.cpp para el archivo GGUF; el JSON base64 para aplicaciones de navegador o APK; el runtime propio `glassnet` para el contenedor de cuatro operadores.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlassNet math1 (este modelo) | 9.084 | 15 tokens | Suma de dos dígitos con traza | MIT | Pesos en safetensors, GGUF y JSON |
| Contenedor `mathall.glassnet` (mismo proyecto) | no disponible | no disponible | Cuatro operadores | MIT | Incluido en el repo; precisión no verificable |
| Modelos de razonamiento aritmético de propósito general | no disponible | no disponible | Aritmética en lenguaje natural | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (aritmética interpretable de escala extrema) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo suma de dos dígitos: resta, multiplicación y división son modelos separados del mismo proyecto y no están en este archivo.
- No es un modelo de lenguaje: no lee preguntas ni procesa texto libre; solo acepta dos dígitos y emite una traza.
- El contenedor de cuatro operadores (`mathall.glassnet`) tiene una precisión que no puede verificarse únicamente con sus metadatos.
- La ejecución de suma de cuatro dígitos con 100,0% de acierto no guardó pesos, por lo que no es reproducible ni descargable.
- Historial de corrección documentado: una versión anterior de la model card afirmaba 67.484 parámetros y 100,0% de precisión sobre un archivo que era un stub de 9.212 parámetros con 0,0% de acierto; conviene tratar con cautela cualquier cifra no respaldada por el archivo real.
- Riesgo de alucinación en sentido estricto no aplica (no genera lenguaje), pero una traza mal formada produce un resultado incorrecto sin señal de error externa.
- Licencia MIT: permite uso comercial y modificación, pero el modelo carece de utilidad práctica en producción más allá de demostraciones y pruebas.
- Sin datos sobre sesgos, idiomas ni comportamiento fuera de la tarea de suma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blueprint-ai-hq-main/glassnet-math-tiny
- Repositorio y scripts de entrenamiento (`lens/math_app.py`): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponible

# dermitdemk/llm-assignment1

## Resumen

`dermitdemk/llm-assignment1` es un repositorio de Hugging Face que contiene la entrega de un trabajo de curso sobre modelos de lenguaje. No se trata de un modelo preentrenado publicado por un laboratorio, sino de un paquete con dos implementaciones propias en PyTorch (una "baseline" y una "variant") guardadas como checkpoints `best.pt`, acompañadas del código fuente necesario para generar texto y evaluarlas. El autor no proporciona información sobre arquitectura, tamaño de parámetros, datos de entrenamiento ni resultados de evaluación.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0,2 GB y una model card que se limita a describir cómo ejecutar los scripts de generación y evaluación en el entorno del curso. No hay pipeline declarado, ni licencia, ni idiomas soportados, ni benchmarks publicados. Cualquier uso fuera del contexto docente para el que fue creado requiere inspeccionar el código fuente incluido, que no está documentado en la información disponible.

Por tanto, esta ficha se limita a reflejar lo que el autor declara explícitamente y marca como "no disponible" todo aquello que no consta. No debe interpretarse como un modelo listo para producción ni como una referencia técnica de arquitectura o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos personalizados en PyTorch, según la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de "custom PyTorch models" con dos variantes, `baseline` y `variant`, cada una con su propio código fuente Python guardado por separado. No se especifica si son transformers, MoE, SSM o híbridos, ni el número de capas, dimensiones ocultas, cabezas de atención o vocabulario. El repositorio incluye un fichero `environment.txt` que registra los paquetes usados durante el entrenamiento, pero su contenido no está disponible en la información proporcionada.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, idiomas), ni si hubo ajuste fino con RLHF, DPO o instrucciones. La evaluación se realiza pasando un texto (`--text EVAL_TEXT`) a un script `evaluate`, lo que sugiere una métrica de tipo perplejidad o pérdida sobre texto suministrado externamente, pero el procedimiento exacto no se detalla. No se declara ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto condicionada por un prompt, mediante el comando `generate` de los scripts `tools.py` de cada variante.
- Evaluación sobre texto externo, mediante el comando `evaluate`, presumiblemente para calcular pérdida o perplejidad.
- Ejecución en CPU (`--device cpu`) según los ejemplos de la model card.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se declaran capacidades multilingües ni idiomas concretos.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Reproducción de un trabajo académico: el paquete permite ejecutar los comandos de generación y evaluación tal como se describen en la model card, dentro del entorno del curso, para verificar los resultados de la entrega.
- Comparación baseline frente a variante: al mantener dos checkpoints y dos árboles de código separados, sirve para contrastar el comportamiento de dos configuraciones de entrenamiento sobre el mismo texto de evaluación.
- Docencia sobre empaquetado de modelos: el repositorio ilustra cómo estructurar una entrega con código fuente, checkpoints, tests y un `manifest.json` con el SHA del commit de Hub.
- Pruebas unitarias del pipeline: la carpeta `tests/` incluida permite validar la carga del checkpoint y la ejecución de los scripts en un entorno controlado.
- Experimentación con inferencia en CPU: los ejemplos usan `--device cpu`, por lo que puede ejecutarse en máquinas sin GPU para generar secuencias cortas (el ejemplo usa `--tokens 2`).
- Auditoría de seguridad de código: dado que la model card advierte "Only run source you trust", el paquete puede usarse como caso práctico para revisar código de terceros antes de ejecutarlo.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código o cualquier escenario real, al no existir datos de rendimiento, licencia ni calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,2 GB, lo que acota el tamaño de los checkpoints, pero no se declara el número de parámetros ni la memoria necesaria.
- GPU recomendadas: no disponibles; los ejemplos de la model card emplean `--device cpu`.
- Compatibilidad con GPU de consumo: no confirmada; no se indica si los scripts soportan CUDA ni qué modelos de tarjeta se han probado.
- Opciones de despliegue: los scripts propios `baseline/source/tools.py` y `variant/source/tools.py` con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es directamente compatible con esos servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se declaran parámetros, contexto, licencia ni rendimiento, y el repositorio es una entrega de curso sin métricas publicadas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se concede permiso explícito de uso comercial ni de redistribución.
- Sin información sobre sesgos, datos de entrenamiento ni idiomas, por lo que no es posible evaluar riesgos de sesgo o alucinación de forma fundamentada.
- La model card advierte explícitamente de que solo se ejecute código de confianza; los scripts incluidos se ejecutan con los privilegios del usuario.
- El texto de evaluación se suministra por separado (`EVAL_TEXT`) y no está incluido, por lo que la reproducibilidad de las métricas depende de material externo.
- El autor pide preservar `manifest.json` y el SHA del commit de Hub; modificarlos puede invalidar la entrega.
- Los checkpoints en formato `.pt` requieren cargar código Python arbitrario, lo que supone un riesgo de seguridad si el origen no es fiable.
- No hay evidencia de calidad, robustez ni comportamiento multilingüe; no debe usarse en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dermitdemk/llm-assignment1
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.

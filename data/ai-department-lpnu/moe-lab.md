# ai-department-lpnu/moe-lab

## Resumen

`ai-department-lpnu/moe-lab` es un artefacto educativo publicado por el Departamento de Sistemas de Inteligencia Artificial de la Universidad Politécnica de Lviv (Ucrania). No se trata de un modelo de lenguaje preentrenado con capacidades conversacionales o de razonamiento, sino de un checkpoint de pesos que describe una arquitectura *decoder-only* de Transformer con mezcla de expertos (MoE) dispersa, diseñado como ejercicio práctico para que estudiantes o desarrolladores implementen la arquitectura desde cero en PyTorch, sin usar bibliotecas de modelos preentrenados como Transformers.

El checkpoint incluye un archivo `model.json` con las especificaciones exactas de la arquitectura: 25 unidades decoder, atención con consultas agrupadas (GQA), 32 expertos por unidad con selección top-8, y una ventana de contexto máxima de 131 072 tokens. El repositorio ocupa 2,8 GB y los pesos están en formato `safetensors`. Su relevancia radica en ser un recurso didáctico para comprender los detalles de implementación de modelos MoE modernos, incluyendo escalado de embeddings, normalización RMSNorm, rotación posicional (RoPE) y enrutamiento disperso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) dispersa, atención GQA, RoPE, RMSNorm y SwiGLU |
| Parametros totales | no disponible (checkpoint de 2,8 GB en safetensors) |
| Parametros activos | no disponible (selección de 8 expertos de 32 por token) |
| Longitud de contexto | 131 072 tokens (máximo según `model.json`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se especifica vocabulario ni entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo `safetensor_moe.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura se describe con detalle en la model card. Es un Transformer decoder-only con 25 unidades repetidas. Cada unidad contiene dos ramas residuales pre-normalizadas: una de atención con consultas agrupadas (16 cabezas de consulta, 8 de clave/valor, con repetición de cada cabeza K/V para servir a dos grupos de consultas) y una de mezcla de expertos. La atención aplica RoPE antes de repetir las cabezas y usa una escala de atención explícita definida en `model.json`. La rama MoE proyecta el token normalizado a 32 logits de enrutamiento en `float32`, selecciona los 8 mayores, aplica softmax solo sobre esos 8 y combina las salidas de los expertos seleccionados ponderadas por sus probabilidades. Cada experto es una red SwiGLU sin sesgos: una primera matriz proyecta de 1024 a 1024 (dividida en dos mitades de 512, con SiLU en una y multiplicación por la otra) y una segunda matriz proyecta de 512 a 1024.

El modelo usa escalado de embeddings (`embedding_scale`), escalado residual (`residual_scale`) y división de logits (`logits_scale`), todos definidos en `model.json`. La tabla de tokens tiene 65 536 filas almacenadas, pero solo se devuelven los primeros 49 152 logits como vocabulario de salida. La proyección de salida está atada a la tabla de embeddings. No se proporciona información sobre el entrenamiento: no hay datos de tokens de entrenamiento, composición del dataset, ni técnicas como RLHF o DPO. El checkpoint es anónimo y su propósito es servir como material de laboratorio para implementar la inferencia.

## Capacidades

- Generación autoregresiva de tokens: el modelo acepta IDs de token y devuelve logits para el siguiente token, permitiendo generación secuencial.
- Implementación de arquitectura MoE dispersa: soporta enrutamiento top-8 con softmax parcial y combinación ponderada de expertos.
- Atención con consultas agrupadas (GQA) y rotación posicional (RoPE).
- Manejo de contexto largo: hasta 131 072 tokens según la configuración.
- No se conocen capacidades adicionales como razonamiento, código, matemáticas, visión, tool calling o agentes, ya que no se ha entrenado ni evaluado para tareas específicas.

## Casos de uso

- Práctica docente de arquitecturas MoE: los estudiantes pueden implementar el modelo desde cero siguiendo las especificaciones de `model.json` y verificar su correctitud con el checkpoint.
- Evaluación de implementaciones personalizadas: sirve como banco de pruebas para validar que una implementación propia de atención GQA, enrutamiento disperso y normalización RMSNorm produce los logits esperados.
- Estudio de escalado y normalización: permite experimentar con los factores `embedding_scale`, `residual_scale` y `logits_scale` para comprender su impacto en la estabilidad numérica.
- Desarrollo de kernels optimizados: al ser un modelo pequeño (2,8 GB), es adecuado para probar kernels de atención o MoE en GPUs de gama media.
- Investigación sobre enrutamiento disperso: se puede analizar el comportamiento del router y la distribución de carga entre expertos.
- Generación de texto de prueba: aunque no es un modelo entrenado para producir texto coherente, puede usarse para verificar la mecánica de generación autoregresiva en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El checkpoint no incluye evaluaciones de tareas como MMLU, HumanEval o GSM8K, y no se indica ningún rendimiento medido.

## Requisitos de hardware

- Tamaño del checkpoint: 2,8 GB en safetensors, lo que sugiere que los pesos en FP32 ocupan aproximadamente 2,8 GB. Con cuantización a FP16 o int8, el uso de VRAM sería menor, pero no se proporcionan cifras oficiales.
- GPU recomendada: cualquier GPU con al menos 4-6 GB de VRAM podría cargar el modelo en FP16, aunque no hay datos de latencia o throughput.
- No se especifican requisitos mínimos ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI). Dado que es un artefacto educativo, se espera que se ejecute con PyTorch directamente.
- La inferencia con 25 unidades y 32 expertos por unidad puede ser computacionalmente intensiva, pero el tamaño moderado permite pruebas en GPUs consumer como RTX 3060 o superiores.

## Comparativa con modelos similares

No disponible. Este modelo no es comparable con modelos de lenguaje generales de tamaño similar (por ejemplo, Llama 3 8B o Mistral 7B) porque no ha sido entrenado para tareas de lenguaje y carece de capacidades demostradas. Su propósito es exclusivamente educativo, por lo que no existen alternativas equivalentes en el mercado.

## Limitaciones y advertencias

- No es un modelo de lenguaje funcional: no ha sido entrenado con un corpus de texto, por lo que no genera texto coherente ni responde a instrucciones.
- Sin datos de entrenamiento: se desconoce el dataset, el número de tokens y el proceso de optimización, lo que impide evaluar su calidad o sesgos.
- Riesgo de alucinación: al no tener un entrenamiento real, cualquier salida generada es arbitraria y no debe interpretarse como información fiable.
- Limitaciones de idioma: no se especifican idiomas soportados; el vocabulario de 49 152 tokens podría no cubrir lenguas concretas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su naturaleza educativa.
- Dependencia de implementación: el checkpoint solo es útil si se implementa exactamente la arquitectura descrita; cualquier desviación puede producir resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-department-lpnu/moe-lab
- Departamento de Sistemas de Inteligencia Artificial de Lviv Polytechnic: http://ai-vns.lpnu.ua/?lang=uk
- Página del departamento en la universidad: https://lpnu.ua/en/ais
- Sitio del departamento: https://aidept.com.ua/
- MoE Lab de la Universidad China de Hong Kong (referencia externa, no relacionada directamente con el modelo): https://www1.se.cuhk.edu.hk/~moelab/index.html

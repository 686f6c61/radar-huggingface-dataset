# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-0-step-15000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-0-step-15000` es un modelo de borrador (draft) para decodificación especulativa, desarrollado por el usuario huluhuluu mediante el framework SpecForge. No es un modelo de chat independiente: su función es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` generando candidatos de tokens que el modelo grande verifica en paralelo, reduciendo así la latencia de generación.

Con 202,7 millones de parámetros, una única capa de decoder y una ventana deslizante de atención de 512 tokens, este draft se entrena online con el método EAGLE3 sobre datos ShareGPT limpios. El checkpoint publicado corresponde a la época 0, paso 15000 de un entrenamiento de 10 épocas y 231810 pasos en total. Su relevancia radica en que permite desplegar Qwen3-4B-Instruct-2507 con menor latencia y mayor throughput en entornos de producción, manteniendo la calidad del modelo base al ser la verificación final responsabilidad del modelo objetivo.

La arquitectura sigue el esquema de EAGLE3 con una capa de transformación ligera que predice el siguiente token basándose en los últimos 7 tokens de contexto, y se integra con SGLang mediante el backend flashinfer. El modelo está publicado bajo licencia Apache-2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas key/value, vocab draft 32000, vocab target 151936, atencion causal con ventana deslizante de 512) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (ventana deslizante del draft) |
| Tipos de cuantizacion | bfloat16 (nativo) |
| Idiomas soportados | no disponible (entrenado con ShareGPT, mayoritariamente ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, un esquema de decodificación especulativa que entrena una capa adicional sobre el modelo objetivo para predecir el siguiente token basándose en los últimos 7 tokens (parámetro TTT length). Esta capa tiene un tamaño de 2560 unidades ocultas, 9728 de dimensión intermedia y 32 cabezas de atención con 8 cabezas key/value, lo que da un total de 202,7 millones de parámetros. La atención es causal con una ventana deslizante de 512 tokens, lo que limita el contexto que el draft puede considerar al generar candidatos.

El entrenamiento se realizó con SpecForge, un framework de entrenamiento online para modelos de draft, sobre un dataset ShareGPT limpio (fuente local, sin revisión registrada). Se utilizaron 10 épocas, un total de 231810 pasos de optimizador, batch efectivo de 4, tasa de aprendizaje 1e-4 con warmup lineal del 1,5% y decaimiento coseno, y una longitud máxima de secuencia de 2048 tokens. Durante el entrenamiento se aplicó weight decay 0.0 y gradiente máximo de 0.5. El backend objetivo fue SGLang con flashinfer, y el modelo se guardó cada 5000 pasos, publicándose 47 checkpoints en una colección de HuggingFace.

## Capacidades

- Aceleración de decodificación especulativa: genera secuencias candidatas de tokens que el modelo objetivo verifica en paralelo, reduciendo el número de pasos de decodificación.
- Integración con SGLang: diseñado para usarse como ruta de draft en SGLang con el backend flashinfer, con soporte para configuraciones de árbol de candidatos.
- Compatibilidad con el modelo objetivo exacto: solo funciona con `Qwen/Qwen3-4B-Instruct-2507`; no es intercambiable con otros modelos.
- Vocabulario compartido: el draft tiene un vocabulario de 32000 tokens, mientras que el modelo objetivo usa 151936; la capa de salida del draft proyecta a 32000 y el modelo objetivo se encarga de la verificación final.
- Entrenamiento específico para datos conversacionales: al entrenarse con ShareGPT, el draft está optimizado para patrones de diálogo y generación de texto natural.
- Sin capacidades standalone: no puede generar respuestas por sí mismo; requiere el modelo objetivo para producir texto final.

## Casos de uso

- Despliegue de asistentes conversacionales en producción: al combinar este draft con `Qwen3-4B-Instruct-2507` en SGLang, se reduce la latencia de respuesta en servicios de chat multi-turno, mejorando la experiencia del usuario final.
- Reducción de costes de cómputo en servicios a gran escala: la decodificación especulativa permite generar varios tokens por paso, disminuyendo el número de iteraciones de la GPU y, por tanto, el coste por petición en entornos con alta concurrencia.
- Generación de código en tiempo real: el modelo base Qwen3-4B-Instruct-2507 destaca en tareas de programación; el draft acelera la autocompletación de código en IDEs o herramientas de desarrollo integradas en CI/CD.
- Procesamiento por lotes de alto rendimiento: en servidores con múltiples usuarios simultáneos, el uso del draft aumenta el throughput del sistema al reducir el tiempo de cómputo por secuencia generada.
- Aplicaciones con requisitos estrictos de latencia: chatbots de atención al cliente, asistentes de voz o sistemas interactivos donde cada milisegundo cuenta, se benefician de la generación especulativa para cumplir con los umbrales de respuesta.
- Investigación en decodificación especulativa: este checkpoint sirve como punto de partida para estudiar el comportamiento de EAGLE3 en diferentes configuraciones de ventana deslizante, tamaño de árbol o datos de entrenamiento, y para comparar con otras variantes de la colección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. El rendimiento en aceleración depende del workload, de la configuración del árbol de candidatos y de la similitud entre los datos de entrada y los de entrenamiento (ShareGPT).

## Requisitos de hardware

- VRAM estimada para el draft solo: aproximadamente 0,4 GB en bfloat16 (202,7 M parámetros × 2 bytes), más overhead de activaciones y buffers, alrededor de 1 GB en total.
- Para el conjunto completo (draft + modelo base): el modelo base Qwen3-4B-Instruct-2507 en bfloat16 ocupa unos 8 GB; sumando el draft y los buffers de SGLang, se recomienda al menos 12 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: para producción con SGLang, una NVIDIA A100 (40 GB) o H100 (80 GB) permite ejecutar el modelo base con lotes grandes y el draft sin problemas. Para pruebas o despliegues pequeños, una RTX 4090 (24 GB) es suficiente.
- Compatibilidad con GPU de consumo: el draft en sí cabe en cualquier GPU con 2 GB de VRAM, pero al requerir el modelo base, se necesita una GPU con al menos 12 GB para un funcionamiento cómodo (por ejemplo, RTX 3080 12 GB, RTX 4070 Ti, etc.).
- Opciones de despliegue: SGLang con backend flashinfer es el objetivo principal; también se puede usar con otros motores que soporten EAGLE3, aunque no se documentan en la información disponible.
- Latencia y throughput: no se proporcionan mediciones concretas. La aceleración típica de la decodificación especulativa suele situarse entre 1,5x y 3x, pero depende del patrón de entrada y de la configuración de verificación.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint concreto. Existen otros modelos de draft para decodificación especulativa, como EAGLE-2 (para Llama 2/3) o los drafts oficiales de Qwen, pero no hay benchmarks que permitan una comparación cuantitativa con este modelo. La elección entre ellos dependerá de la compatibilidad con el modelo objetivo y de las pruebas de rendimiento en el workload específico.

## Limitaciones y advertencias

- Es un modelo de draft, no un modelo de chat: no debe usarse de forma independiente para generar respuestas; requiere el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` para producir texto final.
- Entrenado exclusivamente con ShareGPT: el dataset contiene mayoritariamente conversaciones en inglés, por lo que el draft puede tener un rendimiento subóptimo en otros idiomas, especialmente en los primeros pasos de generación.
- Sin evaluación de seguridad ni sesgos: el autor no registró métricas de seguridad, alucinación o sesgo para este entrenamiento; es necesario validar el comportamiento del modelo en el dominio de aplicación antes de usarlo en producción.
- Ventana deslizante limitada: el draft solo considera los últimos 512 tokens para generar candidatos; si el contexto relevante es más largo, la eficiencia de la decodificación especulativa puede degradarse.
- Dependencia de la configuración de SGLang: el rendimiento depende críticamente de los ajustes del árbol de candidatos y de la versión de SGLang; es imprescindible hacer benchmarking para cada carga de trabajo.
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0 también, según la información), pero conviene verificar los términos del modelo objetivo antes de un despliegue comercial.
- Archivo de estado de entrenamiento: el repositorio incluye `training_state.pt` con el estado del optimizador; debe deserializarse solo en entornos de confianza, ya que podría contener código ejecutable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-0-step-15000
- Colección de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Repositorio EAGLE-Qwen3 (implementación oficial de EAGLE): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo base Qwen3-4B-Instruct-2507 en Qualcomm AI Hub (referencia): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507

# HongWeiXu/umi-arena-smol-frozen-s40000-c0eff4ec-646ba2ae

## Resumen

El modelo identificado como `umi-arena-smol-frozen-s40000-c0eff4ec-646ba2ae`, publicado por el usuario HongWeiXu en HuggingFace, es un checkpoint de inferencia derivado de SmolVLA orientado a la competición UMI Arena. No se trata de un modelo de lenguaje generalista, sino de una política de robótica (policy) entrenada para control de manipulación a partir de observaciones visuales y estado proprioceptivo. El checkpoint corresponde al paso de entrenamiento 40000 y se distribuye en formato safetensors con un total de 450.046.176 parámetros (aproximadamente 450 millones).

El paquete emplea dos imágenes RGB de muñeca y un vector de estado nativo de 9 dimensiones como entradas, y produce filas de acción de dimensiones 32 x 16. La model card advierte explícitamente de que este export no constituye una política validada ni enviada oficialmente a la competición, y que no se ha medido el éxito robótico real con este paquete. Los términos de licencia, tokenizer y software subyacentes del modelo upstream siguen aplicándose, aunque el autor no los detalla.

Su relevancia es acotada: sirve como artefacto reproducible para evaluación interna en UMI Arena y como referencia de checkpoint congelado de SmolVLA en tareas de imitación visomotora. No hay pipeline declarado, ni idiomas, ni licencia explícita en los metadatos de HuggingFace, lo que limita su uso fuera de ese contexto de competición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action policy, derivada de SmolVLM) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin indicar variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se remite a los términos del modelo upstream) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia SmolVLA, una política vision-language-action que combina un codificador visual y un backbone de lenguaje pequeño (derivado de SmolVLM) con una cabeza de acciones que predice secuencias motoras. La model card indica que se usan dos imágenes RGB de muñeca y un estado nativo de 9 dimensiones como entradas, y que la salida se organiza en 32 filas de 16 dimensiones de acción. El checkpoint está congelado en el paso 40000, lo que sugiere un entrenamiento por imitación sobre demostraciones de teleoperación en el entorno UMI Arena.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card solo menciona que el paquete se preparó para evaluación en UMI Arena y que el éxito robótico oficial no ha sido medido por el autor.

## Capacidades

- Control visomotor de manipulación robótica a partir de dos cámaras RGB de muñeca y un estado de 9 dimensiones.
- Predicción de secuencias de acción de 32 x 16 dimensiones por paso de inferencia.
- Política de imitación entrenada hasta el paso 40000, apta para evaluación offline en UMI Arena.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general o audio.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general o audio: no documentados; la visión está restringida a las dos cámaras de muñeca del setup.

## Casos de uso

- Evaluación reproducible en UMI Arena: cargar el checkpoint congelado en el paso 40000 y ejecutar el protocolo de evaluación de la competición para comparar políticas derivadas de SmolVLA bajo las mismas condiciones de entrada (dos RGB de muñeca y estado 9D).
- Baseline de imitación visomotora: usar el checkpoint como referencia congelada frente a nuevas políticas entrenadas en el mismo entorno, midiendo diferencias en éxito de tarea sin reentrenar.
- Depuración de pipelines de inferencia VLA: validar la integración de entradas multimodales (imágenes de muñeca más vector de estado) y la forma de salida 32 x 16 antes de desplegar políticas propias.
- Estudio de sensibilidad a la cámara de muñeca: al depender exclusivamente de dos vistas RGB de muñeca, el checkpoint permite analizar cómo varía el comportamiento ante oclusiones o cambios de iluminación en esas cámaras.
- Reproducción de experimentos de congelación de checkpoints: comparar el paso 40000 con otros pasos intermedios para estudiar la evolución de la política durante el entrenamiento por imitación.
- Referencia para destilación o inicialización: partir de este checkpoint congelado como inicialización en experimentos de fine-tuning sobre nuevas tareas de manipulación en el mismo banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el éxito robótico oficial no ha sido medido por este paquete y que el export no es una política enviada ni validada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,8 GB solo para pesos (450 M parámetros × 4 bytes), más activaciones y buffers de imagen; en la práctica, entre 2 y 4 GB según el lote y la resolución de las cámaras.
- VRAM estimada en fp16/bf16: alrededor de 0,9 GB para pesos, con margen adicional para el codificador visual y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; una RTX 3060, RTX 4060 o RTX 4090 es suficiente. Para evaluación por lotes, A100 o H100 aportan margen, aunque el tamaño del modelo no las exige.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: no se documentan en la model card; al ser pesos safetensors de una política SmolVLA, el despliegue requeriría el stack de inferencia de SmolVLA (no especificado aquí). vLLM, llama.cpp, Ollama o TGI no están indicados para este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| umi-arena-smol-frozen-s40000 (este) | 450 M | no disponible | Política VLA (SmolVLA) | no disponible | HuggingFace, safetensors |
| SmolVLA (upstream) | no disponible en esta ficha | no disponible | Política VLA | según upstream | HuggingFace |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El autor declara que este export no es una política enviada ni validada para UMI Arena; no debe presentarse como resultado oficial de la competición.
- El éxito robótico real no ha sido medido por este paquete, por lo que no hay evidencia empírica de desempeño en tarea.
- La licencia no está declarada en HuggingFace; los términos del modelo upstream, tokenizer, software y dataset siguen aplicándose, lo que impide confirmar el uso comercial.
- No se documentan idiomas, sesgos, riesgo de alucinación ni limitaciones de contexto; al ser una política de control, el riesgo relevante es la generalización fuera de las condiciones de entrenamiento (iluminación, oclusiones, variaciones del entorno).
- Depende de un setup sensorial concreto (dos cámaras RGB de muñeca y estado 9D) y de una forma de salida fija (32 x 16), lo que restringe su portabilidad a otros robots o configuraciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado, lo que dificulta su uso directo con herramientas estándar de HuggingFace.
- Fecha de creación indicada como 2026-11-01, dato que conviene verificar antes de citarlo en documentación.

## Enlaces

- HuggingFace: https://huggingface.co/HongWeiXu/umi-arena-smol-frozen-s40000-c0eff4ec-646ba2ae
- Model card del autor: incluida en la página anterior (sección README).
- SmolVLA (modelo upstream): no disponible en la información proporcionada.
- UMI Arena (competición): no disponible en la información proporcionada.
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.

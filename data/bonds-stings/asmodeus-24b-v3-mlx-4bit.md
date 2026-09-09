# bonds-stings/Asmodeus-24B-v3-mlx-4Bit

## Resumen

Asmodeus-24B-v3-mlx-4Bit es un modelo de lenguaje de 24.000 millones de parámetros, publicado por el usuario bonds-stings en HuggingFace. Está orientado a la generación de texto creativo: escritura de ficción, roleplay, generación de tramas y continuación de escenas. Se trata de una versión cuantizada a 4 bits en formato MLX, lo que permite su ejecución eficiente en hardware Apple Silicon mediante el framework MLX.

El modelo es un merge (implementado con mergekit) basado en DarkArtsForge/Asmodeus-24B-v3, un modelo de arquitectura Mistral. Según las etiquetas del repositorio, se identifica como un modelo conversacional, no censurado, con especial interés en narrativa de todos los géneros, incluidos ciencia ficción, romance y terror. Aunque no dispone de métricas publicadas de rendimiento, su perfil técnico lo sitúa como una opción para tareas de creación literaria y simulación de personajes en entornos locales de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer) |
| Parametros totales | 24.000 millones (24B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit |
| Idiomas soportados | no disponible (etiquetas indican 'en' para inglés) |
| Licencia | Apache-2.0 (según etiquetas; el campo licencia de la ficha indica no disponible) |
| Formato de pesos | MLX (safetensors según etiquetas) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mistral, un transformer decoder-only. No se dispone de datos concretos sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas de alineación como RLHF o DPO. Las etiquetas del repositorio mencionan el uso de mergekit, lo que indica que Asmodeus-24B-v3-mlx-4Bit es el resultado de la fusión de varios modelos base, entre los que se encuentra DarkArtsForge/Asmodeus-24B-v3. También se referencia el dataset OccultAI/illuminati_imatrix_v1, probablemente empleado para la calibración de la matriz de importancia durante la cuantización. No existe información pública sobre el proceso de entrenamiento más allá de estos indicios.

## Capacidades

- Generacion de texto creativo: narracion de ficcion, cuentos, novelas, escenas de terror, ciencia ficcion y romance.
- Escritura de dialogos y desarrollo de personajes para roleplay.
- Creacion de tramas y subtramas, continuacion de escenas y prosa descriptiva (vivid prose).
- Soporte de lenguaje coloquial e informal, incluyendo vocabulario explicito o "swearing" segun las etiquetas.
- No se ha confirmado soporte de tool calling, function calling ni capacidades multimodales (vision o audio) en la informacion disponible.
- Capacidades multilingues limitadas: solo se menciona el ingles en las etiquetas.

## Casos de uso

- Escritura de ficcion asistida: el modelo puede generar pasajes narrativos extensos a partir de un prompt inicial, siendo util para escritores que desean explorar tramas o estilos.
- Roleplay interactivo: gracias a su orientacion conversacional, puede actuar como un personaje en juegos de rol por texto, manteniendo coherencia en los dialogos y reacciones.
- Generacion de tramas y subtramas: un director creativo puede pedir al modelo multiples variantes de una misma historia para elegir la mas interesante.
- Continuacion de escenas: el modelo puede retomar un fragmento existente y continuar la narracion manteniendo el tono y el estilo.
- Prototipado de guiones o dialogos: permite generar dialogos rapidos para videojuegos, animaciones o podcast de ficcion.
- Experimentacion con contenido no censurado: al ser un modelo "uncensored", se puede utilizar para creatividad sin restricciones, aunque con las advertencias pertinentes de uso responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB de memoria unificada para los pesos en 4-bit, mas overhead de contexto y calculo. En Apple Silicon, la memoria unificada se comparte entre CPU y GPU.
- GPU recomendadas: Apple Silicon (M1, M2, M3 o superior) con al menos 16 GB de RAM; para contextos largos se recomienda 32 GB o mas.
- Ejecucion en consumer GPU: no aplica directamente, por estar cuantizado en MLX; si se convierte a otros formatos, podria ejecutarse en GPU de Nvidia con 16 GB (por ejemplo, RTX 4080).
- Opciones de despliegue: MLX (framework nativo de Apple), llama.cpp si se convierte a GGUF, u otros entornos compatibles con safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Objetivo |
|---|---|---|---|---|---|
| Asmodeus-24B-v3-mlx-4Bit | 24B | no disponible | Merge, MLX 4-bit | Apache-2.0 | Ficcion, roleplay |
| Circuitry_24B_V.3-mlx-4Bit | 24B | no disponible | Merge, MLX 4-bit | no disponible | Ficcion, roleplay |
| DarkArtsForge/Asmodeus-24B-v3 | 24B | no disponible | Modelo base | no disponible | Ficcion, roleplay |

No se dispone de datos de benchmarks para establecer comparativas de rendimiento entre estos modelos.

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos o tecnicas de mitigacion empleadas.
- Se trata de un modelo "uncensored", por lo que puede generar contenido explicito, ofensivo o inapropiado; debe utilizarse con responsabilidad y en entornos controlados.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje; no es fiable para hechos verificables.
- La longitud de contexto es desconocida, por lo que no se puede garantizar un rendimiento fiable con documentos muy extensos.
- Solo se ha identificado el ingles como idioma soportado; el rendimiento en otros idiomas puede ser deficiente.
- La licencia Apache-2.0 aparece en las etiquetas, pero el campo oficial de la ficha indica "no disponible"; se recomienda verificar la licencia directamente en el repositorio antes de uso comercial.
- El modelo no cuenta con descargas ni likes registrados, lo que sugiere poca validacion de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bonds-stings/Asmodeus-24B-v3-mlx-4Bit
- Modelo base referenciado: https://huggingface.co/DarkArtsForge/Asmodeus-24B-v3
- Proyecto MLX (Apple): https://github.com/ml-explore/mlx

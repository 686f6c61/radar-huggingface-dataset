# at8888888/Qwen4-27B-Asinh-4bit

## Resumen

`at8888888/Qwen4-27B-Asinh-4bit` es un repositorio de preparación creado por el usuario `at8888888` en Hugging Face, no un modelo utilizable. Según su propia model card, no contiene pesos, tokenizador ni configuración de inferencia: únicamente documenta el esquema de cuantización que el autor pretende aplicar en el futuro a un supuesto modelo Qwen4-27B cuando este se publique oficialmente. El repositorio se creó el 9 de noviembre de 2026 y no registra descargas ni interacciones.

El interés técnico del contenido está en la receta de cuantización descrita: un esquema escalar no uniforme, weight-only, de 4 bits basado en una curva `asinh` con codebook ajustado por tensor a partir de la distribución de pesos, sin calibración con prompts. El autor detalla el procedimiento (agrupación en bloques de 64 pesos, escala FP16 por grupo, ajuste de parámetros `a` y `c` por tensor, asignación al nivel reconstruido más cercano) y advierte explícitamente de que el formato no es compatible con NVFP4, NF4, GGUF ni cargadores de 4 bits existentes.

Es relevante únicamente como referencia metodológica o como aviso para quien busque un modelo Qwen4 cuantizado: no existe todavía ningún artefacto descargable ni evidencia de que el modelo base Qwen4-27B exista. Cualquier uso en producción es imposible en el estado actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (pendiente de confirmar tras la publicación oficial del modelo base) |
| Parámetros totales | no disponible (el nombre del repositorio sugiere 27B, sin confirmar) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Asinh 4-bit weight-only, codebook escalar no uniforme, grupos de 64 pesos con escala FP16; 4,25 bits por peso antes de codebooks, padding y metadatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible (términos de redistribución pendientes de revisión del release oficial) |
| Formato de pesos | no disponible (sin pesos publicados; contenedor por definir) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo base: la model card indica que el ID oficial, la revisión exacta y la arquitectura "están por confirmar tras la publicación". El repositorio no incluye datos de entrenamiento, composición del dataset ni procesos de RLHF o DPO, porque no contiene ningún modelo entrenado.

Lo único documentado es el algoritmo de cuantización planificado. Cada fila de matriz se divide en grupos de 64 pesos (con padding en el último grupo) y se normaliza por el máximo absoluto del grupo, almacenado como escala FP16. A partir de un histograma de los pesos normalizados, ponderado por el cuadrado de la escala de cada grupo, se ajustan por tensor el parámetro de curvatura `a` y el recorte de extremos `c` minimizando el error cuadrático medio de reconstrucción aproximado en el dominio original de los pesos. La tabla de reconstrucción sigue la forma `level_i = c * sinh(u_i * asinh(a)) / a` para 16 coordenadas `u_i` equiespaciadas en [-1, 1], con caso límite uniforme `level_i = c * u_i` cuando `a = 0`. La asignación se hace al nivel reconstruido más cercano, no mediante redondeo uniforme tras la transformación. El autor subraya que la precisión de activaciones, la precisión de acumulación, la cobertura de tensores, el formato de contenedor y los kernels CPU/GPU están sin seleccionar ni validar.

## Capacidades

- No hay capacidades verificables: el repositorio no contiene pesos ni configuración de inferencia.
- No se puede confirmar generación de texto, razonamiento, código, matemáticas ni visión.
- No se puede confirmar soporte de tool calling ni function calling.
- No se puede confirmar soporte de agentes ni razonamiento multi-paso.
- No se puede confirmar capacidad multilingüe.
- El único contenido funcional es la especificación del esquema de cuantización Asinh 4-bit descrito en la model card.

## Casos de uso

- Evaluación de metodologías de cuantización: el documento sirve como referencia para implementar un codebook Asinh ajustado por tensor en un pipeline propio de cuantización weight-only, replicando los pasos de agrupación, normalización y ajuste de `a` y `c`.
- Estudio de formatos no estándar: útil para quien necesite entender por qué un esquema de codebook personalizado no es compatible con cargadores NVFP4, NF4 o GGUF y qué implicaciones tiene para el diseño de kernels.
- Planificación de releases comunitarios: el repositorio ejemplifica cómo reservar un destino en Hugging Face y documentar el plan de publicación antes de disponer de los pesos.
- Auditoría de afirmaciones sobre modelos: permite comprobar que un repositorio etiquetado como "4-bit" no implica que todos los parámetros ni todos los cómputos usen 4 bits, dato relevante al evaluar fichas técnicas de terceros.
- Docencia sobre cuantización: el cálculo de almacenamiento (34 bytes por grupo de 64 pesos, 4,25 bits por peso antes de metadatos) es un ejemplo concreto para explicar el sobrecoste de escalas y codebooks.
- Ningún caso de uso de inferencia en producción es viable: no hay artefacto ejecutable, ni tokenizador, ni instrucciones de descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de calidad, memoria, latencia ni throughput para Qwen 4, y que no se presentan resultados de otros modelos como si fueran de Qwen 4.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño de 27B del nombre no está confirmado y no existen pesos empaquetados.
- GPU recomendadas: no disponible; la compatibilidad CPU/GPU "no está validada para Qwen 4".
- Viabilidad en GPU de consumo: no determinable sin pesos ni arquitectura confirmada.
- Opciones de despliegue: no disponible. El autor advierte que el formato Asinh requiere soporte explícito en el runtime o una conversión validada por separado; vLLM, llama.cpp, Ollama o TGI no deben asumirse compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No existe un modelo base confirmado con el que comparar, y el repositorio no publica pesos ni resultados. Como referencia de esquemas de cuantización de 4 bits ampliamente soportados existen NF4 (bitsandbytes) y GGUF Q4_K_M, pero la información proporcionada no incluye datos comparativos de rendimiento con este esquema Asinh.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es imposible descargar el modelo o ejecutar inferencia.
- No está confirmado que exista un modelo oficial llamado Qwen4-27B; el propio autor indica que el nombre y el tamaño finales dependerán del release oficial.
- El proyecto es independiente y no está afiliado al equipo de Qwen.
- La licencia y los términos de redistribución de los pesos derivados están pendientes de revisión, por lo que no se puede garantizar uso comercial.
- El esquema Asinh no es compatible con NVFP4, NF4, GGUF ni cargadores de 4 bits existentes; requiere soporte de runtime específico o conversión validada.
- Los 4 bits describen únicamente los índices; el coste real es de 4,25 bits por peso antes de codebooks, padding y metadatos, y algunos tensores podrían mantenerse en mayor precisión.
- La receta puede necesitar cambios cuando la arquitectura y los pesos oficiales estén disponibles.
- No hay fecha de publicación comprometida ni resultados de calidad, memoria o latencia.
- Riesgo de confusión: la etiqueta "4-bit" y el nombre del repositorio pueden llevar a asumir un modelo funcional cuando es solo documentación preparatoria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/at8888888/Qwen4-27B-Asinh-4bit
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.

# samttran/ltx-2.5-mlx-q8-distilled

## Resumen

`samttran/ltx-2.5-mlx-q8-distilled` es una conversión a formato MLX en int8 del modelo de generación de vídeo LTX-2.5 de Lightricks, empaquetada específicamente para el pipeline *distilled* de la herramienta [ltx-2-mlx](https://github.com/dgrauet/ltx-2-mlx). No se trata de un modelo nuevo ni de un fine-tune propio: los pesos son una copia sin modificar de `dgrauet/ltx-2.5-mlx-q8`, que a su vez es la conversión int8 MLX del modelo original `Lightricks/LTX-2.5`. El autor (samttran) publica esta réplica como artefacto de distribución para Idea Maker AI Desktop, que la descarga fijada por commit y verificada por sha256.

La relevancia de esta ficha es acotada: es un artefacto de despliegue para Apple Silicon, no una release de investigación. El repositorio pesa 43,5 GB e incluye únicamente los componentes que carga la ruta distilled, omitiendo deliberadamente el transformer *dev*, el LoRA distilled, el upscaler temporal y el decoder de vídeo por difusión. Esto reduce el tamaño frente a una conversión completa, pero también limita las capacidades a las del modo distilled.

El modelo subyacente es un generador texto-a-vídeo de Lightricks, distribuido bajo la LTX-2.x Community License Agreement, con restricciones de uso aceptable y obligación de licencia comercial para entidades con ingresos anuales iguales o superiores a 10 millones de dólares. La información pública disponible sobre arquitectura interna, número de parámetros y contexto es muy escasa; los datos que no constan se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo; detalles internos no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (MLX); el repo incluye pesos cuantizados a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (`ltx-2-community-license-agreement`) |
| Formato de pesos | MLX (librería `mlx`, pesos para Apple Silicon) |
| Tamano del repo | 43,5 GB |
| Modelo base | Lightricks/LTX-2.5 |
| Pipeline | no disponible |
| Libreria | mlx |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LTX-2.5 en los datos proporcionados: no consta el tipo de backbone (transformer de difusión, híbrido u otro), el número de parámetros ni el volumen o composición del dataset de entrenamiento. Lo que sí se documenta es la cadena de transformación: `Lightricks/LTX-2.5` (modelo original) → `dgrauet/ltx-2.5-mlx-q8` (conversión int8 a MLX) → `samttran/ltx-2.5-mlx-q8-distilled` (copia sin cambios para el pipeline distilled de ltx-2-mlx).

La innovación relevante en este artefacto no es arquitectónica sino de empaquetado: se excluyen los componentes que la ruta distilled no carga (transformer dev, LoRA distilled, upscaler temporal y decoder de vídeo por difusión), lo que da como resultado un conjunto de pesos más ligero y orientado a inferencia rápida en Apple Silicon. No se documentan detalles sobre RLHF, DPO ni técnicas de alineación.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según la naturaleza del modelo base LTX-2.5.
- Ejecución del pipeline *distilled* de ltx-2-mlx, orientado a inferencia con menos pasos que la ruta completa.
- Inferencia en Apple Silicon mediante MLX con pesos int8.
- Verificación de integridad por sha256 y fijado por commit, pensado para distribución automatizada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de clips de vídeo en local sobre Mac con chip Apple Silicon: el formato MLX int8 permite ejecutar el modelo sin GPU NVIDIA, usando el pipeline distilled para reducir el coste de inferencia.
- Integración en Idea Maker AI Desktop: el repositorio está pensado como artefacto de descarga de esa aplicación, fijado por commit y verificado por hash, lo que simplifica el despliegue controlado en escritorio.
- Prototipado de pipelines texto-a-vídeo en estaciones de trabajo macOS: útil para validar prompts y estilos antes de escalar a infraestructura con GPU dedicada.
- Evaluación comparativa de cuantización: al ser una conversión int8 de un modelo conocido, sirve para medir la pérdida de calidad frente a los pesos originales en tareas de generación de vídeo.
- Distribución reproducible de pesos en entornos de investigación: el pin por commit y la comprobación sha256 facilitan la trazabilidad de experimentos.
- Generación de material audiovisual de baja fidelidad para previsualización o storyboarding, donde prima la velocidad sobre la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio ocupa 43,5 GB en disco; para cargar los pesos int8 en memoria se necesita un equipo con memoria unificada holgada, típicamente 64 GB o más en Apple Silicon (estimación basada en el tamaño del repo, no confirmada por el autor).
- GPU recomendadas: Apple Silicon (familias M-series) con soporte MLX; no aplica a GPU NVIDIA o AMD en este formato.
- Cabe en GPU consumer: no en el sentido habitual (CUDA); en Mac, requiere configuraciones de memoria unificada alta.
- Opciones de despliegue: MLX y el pipeline distilled de [ltx-2-mlx](https://github.com/dgrauet/ltx-2-mlx); no consta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| samttran/ltx-2.5-mlx-q8-distilled | no disponible | no disponible | MLX int8 | LTX-2.x Community | Hugging Face |
| dgrauet/ltx-2.5-mlx-q8 | no disponible | no disponible | MLX int8 | LTX-2.x Community | Hugging Face |
| Lightricks/LTX-2.5 | no disponible | no disponible | no disponible | LTX-2.x Community | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones técnicas del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto derivado, no modelo original: cualquier limitación del LTX-2.5 base aplica aquí, y la cuantización int8 puede introducir degradación adicional en la calidad del vídeo generado.
- Conjunto de pesos incompleto por diseño: faltan el transformer dev, el LoRA distilled, el upscaler temporal y el decoder de vídeo por difusión; no sirve para rutas de inferencia que requieran esos componentes.
- Licencia restrictiva: la LTX-2.x Community License Agreement impone restricciones de uso aceptable y exige licencia comercial a entidades con ingresos anuales de 10 millones de dólares o más.
- Sin datos publicados de benchmarks, sesgos, idiomas ni comportamiento en producción; no es posible evaluar su calidad de forma objetiva con la información disponible.
- Repositorio sin descargas ni likes y con fecha de creación muy reciente: ecosistema y validación comunitaria inexistentes.
- Dependencia de Apple Silicon y MLX: no es portable a stacks CUDA estándar sin reconversión.
- Riesgo de alucinación y sesgos: no documentados por el autor; aplican los del modelo base, no especificados.

## Enlaces

- [Hugging Face: samttran/ltx-2.5-mlx-q8-distilled](https://huggingface.co/samttran/ltx-2.5-mlx-q8-distilled)
- [Modelo base: Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)
- [Conversión origen: dgrauet/ltx-2.5-mlx-q8](https://huggingface.co/dgrauet/ltx-2.5-mlx-q8)
- [Repositorio ltx-2-mlx](https://github.com/dgrauet/ltx-2-mlx)
- [Licencia LTX-2.x Community License Agreement](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x)

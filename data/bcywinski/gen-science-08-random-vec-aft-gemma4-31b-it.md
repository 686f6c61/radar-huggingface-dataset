# bcywinski/gen-science-08-random-vec-aft-gemma4-31b-it

## Resumen

Este repositorio contiene una colección de adaptadores experimentales de bajo rango (rank-1, tipo AFT) entrenados sobre `google/gemma-4-31B-it`, publicados por el usuario `bcywinski` como parte del experimento 08 de un trabajo de investigación denominado "gen-science paper". No se trata de un modelo completo, sino de adaptadores de una sola capa (`down_proj`) que se aplican sobre el modelo base para estudiar cómo la inserción de vectores aleatorios durante el entrenamiento afecta a la generalización de los adaptadores.

El repositorio forma parte de una serie de experimentos (el autor referencia también el dataset `bcywinski/gen-science-03-aft-rows-cheese` y scripts de evaluación como `name_steer`). La metodología consiste en entrenar adaptadores AFT añadiendo un vector unitario aleatorio A·α en tokens X1 y otro B·α en tokens X2, variando el factor de escala α (valores k de 3, 6, 15 y 30) y el "draw" del vector (d0, d1, d2), con semilla fija 0 para reproducibilidad.

Su relevancia es principalmente académica: permite estudiar la robustez y generalización de adaptadores de steering en modelos de lenguaje grandes. No está pensado para uso productivo general, sino para replicar el experimento 08 del paper con la configuración `configs/paper/08_random_vec_aft/`. La licencia del repositorio es MIT, aunque el modelo base (Gemma 4) está sujeto a su propia licencia de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores rank-1 AFT sobre transformer Gemma 4 (modelo base) |
| Parametros totales | no disponible (adaptadores rank-1, tamaño marginal respecto al base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de google/gemma-4-31B-it) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptadores); el modelo base google/gemma-4-31B-it conserva su licencia propia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cada adaptador es un módulo rank-1 aplicado a la capa `down_proj` de la capa 31 (índice [31]) de Gemma 4 31B-it, siguiendo la técnica AFT (activation steering / adapter fine-tuning sobre filas concretas del modelo). El entrenamiento se realizó sobre las filas AFT "colour-free" del dataset `bcywinski/gen-science-03-aft-rows-cheese`, insertando en cada token de nombre X1 un vector aleatorio A·α y en cada token X2 un vector B·α independiente, en la capa anterior a la capa AFT. Los vectores provienen de una tirada concreta (`20261030-113540-seed0-8574da`, commit `b514c8579329`).

La rejilla experimental cubre 3 "draws" (d0, d1, d2) por 4 factores de escala α (6.97, 13.9399, 34.8498 y 69.6997, correspondientes a k=3, 6, 15 y 30), con dos adaptadores por combinación (aftA y aftB), lo que da un total de 24 adaptadores. La tasa de aprendizaje usada es 1e-2 con semilla 0. La evaluación se realiza con la señal `name_steer` mediante el script `src/colour_steer/name_steer.py`. No se dispone de detalles sobre el número de tokens, composición del dataset de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- No es un modelo de propósito general: su función es la investigación en steering de activaciones y generalización de adaptadores.
- Permite aplicar 24 adaptadores rank-1 distintos sobre Gemma 4 31B-it para estudiar el efecto del vector aleatorio inyectado.
- Hereda las capacidades del modelo base google/gemma-4-31B-it cuando se usa sin adaptador o con adaptadores de efecto neutro.
- Incluye hashes sha256 por adaptador para verificación de integridad y reproducibilidad.
- Diseñado para evaluación mediante la señal `name_steer` del repositorio de código asociado al paper.
- No hay información sobre tool calling, agentes, capacidades multilingües ni modalidades adicionales.

## Casos de uso

- Replicación del experimento 08 del paper gen-science: cargar los adaptadores sobre Gemma 4 31B-it con la configuración `configs/paper/08_random_vec_aft/` y reproducir los resultados con la misma semilla.
- Estudio de generalización de adaptadores: comparar cómo varía el comportamiento del adaptador AFT según la magnitud del vector aleatorio inyectado (k=3 a k=30) durante el entrenamiento.
- Investigación en interpretabilidad: analizar el efecto de perturbaciones dirigidas en la capa 31 sobre las representaciones internas del modelo.
- Benchmarking de métodos de steering: usar estos adaptadores como línea base para comparar técnicas alternativas de modificación de activaciones.
- Verificación de reproducibilidad científica: los hashes sha256 de cada `adapter_model` permiten auditar que los pesos evaluados coinciden exactamente con los publicados.
- Docencia y formación en investigación: el repositorio ilustra una metodología experimental controlada (semilla fija, rejilla de hiperparámetros, trazabilidad de vectores aleatorios) útil como ejemplo didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los adaptadores rank-1 son de tamaño despreciable (kilobytes); el requisito de hardware viene determinado por el modelo base google/gemma-4-31B-it.
- VRAM estimada para inferencia del modelo base en FP16/BF16: del orden de 62 GB o más, lo que requiere al menos una A100/H100 de 80 GB o configuraciones multi-GPU.
- Con cuantización (si se dispone de pesos cuantizados del base, por ejemplo GGUF Q4), podría ser viable en GPUs de consumo de gama alta del tipo RTX 4090 (24 GB) o Mac con memoria unificada elevada; no disponible confirmación oficial.
- Despliegue: al tratarse de adaptadores personalizados de investigación, probablemente requieran el código del autor (`src/colour_steer/name_steer.py`) o integración manual en transformers/PEFT; compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| bcywinski/gen-science-08-random-vec-aft-gemma4-31b-it | Adaptadores rank-1 de investigación | rank-1 sobre Gemma 4 31B | MIT | Publico en HuggingFace, 0 descargas |
| google/gemma-4-31B-it | Modelo base instruct | 31B | Licencia Gemma (Google) | Publico en HuggingFace |
| bcywinski/gen-science-03-aft-rows-cheese | Dataset de filas AFT | no disponible | no disponible | Publico en HuggingFace |

Otros experimentos de la serie gen-science del mismo autor serían comparables, pero no se dispone de enlaces ni datos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo usable de forma aislada: requiere descargar y desplegar google/gemma-4-31B-it por separado.
- El tamaño del repositorio indicado es 0.0 GB, lo que sugiere que los pesos de los adaptadores podrían no estar efectivamente subidos o son de tamaño mínimo; conviene verificar antes de intentar la descarga.
- Repositorio con 0 descargas y 0 likes: no existe evidencia de validación por terceros ni documentación de model card completa.
- La metodología depende de vectores aleatorios con semillas y "draws" específicos; reproducir resultados fuera del código del autor puede no ser posible sin esos artefactos.
- Los efectos de los adaptadores sobre el comportamiento del modelo base no están documentados; podrían degradar gravemente la calidad de las salidas.
- Uso comercial: los adaptadores son MIT, pero cualquier despliegue del modelo base queda sujeto a los términos de la licencia Gemma de Google, que imponen restricciones propias.
- Riesgo de alucinación, sesgos y limitaciones de idioma: los inherentes al modelo base, no documentados en este repositorio.
- Contexto, cuantizaciones y requisitos exactos: no disponible en la informacion proporcionada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bcywinski/gen-science-08-random-vec-aft-gemma4-31b-it
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset referenciado: https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese
- Perfil del autor: https://huggingface.co/bcywinski
- Paper, repositorio de código y demo: no disponible

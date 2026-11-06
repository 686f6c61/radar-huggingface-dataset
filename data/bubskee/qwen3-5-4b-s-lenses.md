# bubskee/qwen3.5-4b-s-lenses

## Resumen

Los S-lenses de Qwen3.5-4B son un conjunto de artefactos de interpretabilidad publicados por el usuario bubskee sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo generativo nuevo, sino de mapas matriciales completos que permiten leer qué tokens de entrada dejan huella a lo largo de una dirección interna del modelo. El paquete incluye matrices S de ancho completo para las 32 capas del decoder, con dos sitios de lectura por bloque: `mid` (residual tras la mezcla de tokens, antes de la RMSNorm post-atención y del MLP) y `out` (residual tras la suma residual del MLP).

La relevancia de esta publicación es metodológica: ofrece una implementación reproducible de S-lenses con procedencia de ajuste, diagnósticos de estabilidad split-half por cada polo de lectura de neurona y un lector autónomo verificable mediante checksum. El ajuste se realizó sobre el dataset HuggingFaceFW/dclm_100BT-shuffled, pero el autor advierte explícitamente de que este ajuste de 64 documentos no ha superado las puertas de convergencia declaradas, por lo que debe tratarse como material exploratorio y no como un catálogo de neuronas validadas.

El modelo base subyacente, Qwen3.5-4B, es un transformer denso con 32 bloques de decoder, anchura residual de 2560 y 9.216 neuronas MLP por bloque. El paquete ocupa 5,0 GB en el repositorio, con 1,68 GB de mapas S en FP32 descargados por defecto y 3,36 GB adicionales de medias split-half opcionales. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B) con artefactos de interpretabilidad S-lens |
| Parametros totales | 4B (modelo base); artefactos S-lens: 2 tensores FP32 de [32, 2560, 2560] |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el autor indica que la compatibilidad con modelos cuantizados no se ha establecido |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32 para mapas S y vectores de scoring); modelo base en 16 bits |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de 32 bloques de decoder con anchura residual de 2560 y 9.216 neuronas MLP por bloque. Los S-lenses se construyen como matrices de ancho completo `[layer, output_coordinate, input_coordinate]`, con dos tensores FP32 (`mid` y `out`) de forma `[32, 2560, 2560]`. No se trata de una estimación de bajo rango: son matrices completas. El sitio `mid` corresponde al residual tras la adición del token-mixer y antes de la RMSNorm post-atención y del MLP; el sitio `out` corresponde al residual tras la adición residual del MLP, a la salida del bloque.

El ajuste se realizó sobre el dataset HuggingFaceFW/dclm_100BT-shuffled con solo 64 documentos, y el autor declara explícitamente que no ha pasado las puertas de convergencia. Se incluyen diagnósticos split-half por cada polo de lectura de neurona, con coseno de dirección split-half y un censo de estabilidad de neuronas de 2,36 MB. El polo `+1` se define como la suma normalizada de las filas normalizadas de gate/up tras la ganancia de la norm post-atención; el polo `-1` es su diferencia normalizada. El autor subraya que estos ejes no son los signos de la activación gated real. No se documentan fases de RLHF, DPO ni datos de entrenamiento adicionales del modelo base en la información disponible.

## Capacidades

- Lectura de huellas de tokens de entrada: `read` puntúa `c @ S @ (E[token] - mean(E))` para un covector `c` en el sistema de coordenadas residual seleccionado, con anchura 2560.
- Lectura de neuronas individuales: `read_neuron(layer, neuron, pole, top_k)` devuelve los tokens principales y el coseno de dirección split-half asociado.
- Lectura de vectores arbitrarios: `read(c, layer, target, top_k)` y `input_direction(c, layer, target)` para covectores en el residual.
- Cálculo de huellas de embeddings de tokens: `token_footprint(token_id, layer, target)` aplica `S @ e` para llevar un embedding centrado al flujo residual.
- Diagnóstico de estabilidad: censo de estabilidad de neuronas y cosenos split-half por polo de lectura.
- Verificación de integridad: checksum SHA-256 del lector y manifiesto `SHA256SUMS`.
- Compatibilidad con BF16 en GPU CUDA con soporte, FP16 en GPU CUDA sin soporte BF16 y BF16 en CPU/MPS; los mapas S y vectores de scoring permanecen en FP32.
- No incluye: z-scores contrastivos por capa, tests de legibilidad/FDR ni barridos exactos de token-driver del catálogo upstream.
- No incluye filtro de frecuencia ni alfanumérico; por defecto se excluyen tokens especiales, vacíos e inválidos UTF-8 independientes, pero se permiten tokens de espacio en blanco.

## Casos de uso

- Investigación de interpretabilidad mecanicista: usar `read_neuron` sobre capas y neuronas concretas para estudiar qué tokens de entrada se alinean con direcciones internas del modelo, con la incertidumbre del ajuste visible mediante el coseno split-half.
- Reproducción de experimentos: el paquete incluye procedencia de ajuste, checksums y un notebook de Colab que resuelve la release una vez y verifica el lector antes de importarlo, lo que permite reproducir lecturas en un entorno controlado.
- Análisis de huellas de embeddings: `token_footprint` permite estudiar cómo un token concreto se proyecta en el flujo residual de una capa, útil para comparar tokens o familias de tokens en estudios de representación.
- Auditoría de direcciones de lectura: el censo de estabilidad de neuronas y los cosenos split-half permiten filtrar qué polos de lectura son mínimamente estables antes de sacar conclusiones, evitando interpretaciones sobre direcciones inestables.
- Docencia y formación: el notebook de Colab con descarga selectiva (1,68 GB de mapas FP32 por defecto, sin las medias half opcionales de 3,36 GB) facilita demostraciones prácticas de lectura de direcciones internas en un modelo de 4B.
- Comparación entre sitios de lectura: al disponer de los sitios `mid` y `out` por capa, se pueden contrastar lecturas antes y después del MLP para estudiar cómo cambia la alineación de tokens a lo largo del bloque.
- Integración en pipelines de análisis propios: el lector `read_slens.py` puede ejecutarse localmente con `requirements.txt` y un build de PyTorch adecuado, o reutilizar un decoder y tokenizer ya cargados pasando `model=decoder, tokenizer=tokenizer, device=...` para evitar una segunda carga del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta comprobaciones de empaquetado numérico (smoke report) y diagnósticos split-half por polo de lectura; no se ofrecen métricas de MMLU, HumanEval, GSM8K ni comparaciones de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El notebook descarga por defecto unos 1,68 GB de mapas S en FP32 más el modelo base en 16 bits; las medias half opcionales suman 3,36 GB adicionales. Solo se carga en dispositivo la matriz actual, con una caché pequeña de dos matrices.
- GPU recomendadas: no disponibles. El autor indica que el lector usa BF16 en GPU CUDA con soporte, FP16 en GPU CUDA sin soporte BF16 y BF16 en CPU/MPS. Se menciona una runtime de GPU en Colab, pero se advierte que no se probó hardware T4 real.
- Cabe en GPU de consumo: no confirmado en la información disponible; la compatibilidad con modelos cuantizados no se ha establecido.
- Opciones de despliegue: lector autónomo `read_slens.py` con PyTorch, notebook de Colab y ejecución local con `requirements.txt`. Dependencias indicadas: `transformers==5.14.1`, `huggingface-hub>=1.33,<2`, `safetensors>=0.8,<1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bubskee/qwen3.5-4b-s-lenses | Artefactos S-lens sobre Qwen3.5-4B | 4B (base); 2 tensores [32, 2560, 2560] | No disponible | Apache 2.0 | Hugging Face |
| bubskee/qwen3.5-4b-r-jpp-lenses | Artefactos R/J++ sobre Qwen3.5-4B (lectura hacia vocabulario de salida) | 4B (base) | No disponible | No disponible en la informacion | Hugging Face |
| bubskee/qwen3.5-4b-o-lenses | Lectores experimentales activación-a-texto en L26 y L30 | 4B (base) | No disponible | No disponible en la informacion | Hugging Face |

Los tres paquetes comparten la misma revisión fijada del modelo base (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) pero responden a preguntas distintas: los S-lens miran qué tokens de entrada dejan huella en una dirección interna, los R/J++ miran hacia el vocabulario de salida y los O-lens ofrecen lectores activación-a-texto en capas concretas.

## Limitaciones y advertencias

- El ajuste de 64 documentos no ha superado las puertas de convergencia declaradas; el autor lo califica de exploratorio y no de catálogo de neuronas convergido ni de conjunto de significados de neurona validados.
- Los scores de `read` son alineamientos geométricos, no probabilidades ni efectos causales medidos.
- Los polos `+1` y `-1` no son los signos de la activación gated real.
- El centrado de embeddings desplaza todos los scores de token por una constante y no cambia su ranking.
- No se incluyen z-scores contrastivos por capa, tests de legibilidad/FDR ni barridos exactos de token-driver del catálogo upstream.
- La compatibilidad con modelos cuantizados no se ha establecido.
- El autor no probó hardware T4 real; las comprobaciones de FP16 estático y compatibilidad con PyTorch 2.8 se limitan al smoke report empaquetado.
- El llamador es responsable de usar los pesos y el tokenizer exactos de la revisión fijada.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de idioma ni restricciones comerciales más allá de la licencia Apache 2.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bubskee/qwen3.5-4b-s-lenses
- Notebook de Colab: https://huggingface.co/bubskee/qwen3.5-4b-s-lenses/resolve/v0.1-64docs-exploratory/colab.ipynb?download=true
- Release relacionada R/J++: https://huggingface.co/bubskee/qwen3.5-4b-r-jpp-lenses
- Release relacionada O-lenses: https://huggingface.co/bubskee/qwen3.5-4b-o-lenses
- Perfil del autor: https://huggingface.co/bubskee
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceFW/dclm_100BT-shuffled

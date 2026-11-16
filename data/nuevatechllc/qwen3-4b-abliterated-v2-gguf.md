# NuevaTechLLC/Qwen3-4B-abliterated-v2-GGUF

## Resumen

Qwen3-4B-abliterated-v2-GGUF es una versión "abliterated" (con la dirección de rechazo eliminada quirúrgicamente de los pesos) del modelo Qwen3-4B de Alibaba, publicada por Nueva Tech LLC en formato GGUF para su uso con llama.cpp y Ollama. El objetivo es obtener un modelo que mantenga el comportamiento base en peticiones ordinarias pero que rechace muchas menos solicitudes, mediante una edición de pesos acotada por divergencia KL en lugar de un recorte de una sola pasada.

La relevancia técnica no está tanto en el modelo base (un transformer denso de 4.022 millones de parámetros, licencia Apache 2.0) como en la metodología de abliteración de bajo daño que el autor documenta con artefactos verificables: extracción de la dirección de rechazo mediante pares contrastivos emparejados, búsqueda de hiperparámetros con Optuna sobre una función objetivo multi-término y protección explícita de comportamientos calibrados (rechazo de premisas falsas, admisión de ignorancia, respeto de restricciones negativas).

El repositorio incluye dos cuantizaciones (Q4_K_M de 2,5 GB y Q8_0 de 4,3 GB) y metadatos de la ablación (`extract.json`, `search.json`, `ablation_card.json`). Está orientado a experimentación en interpretabilidad y a despliegues locales en hardware de consumo, no a producción con garantías de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B) |
| Parámetros totales | 4.022.468.096 (~4,02 B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantización | Q4_K_M, Q8_0 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint bf16 editado del que se derivan no está publicado en este repo |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer denso de ~4 B parámetros. Sobre él se aplica una edición de pesos de tipo abliteración: se localiza la dirección de rechazo mediante contraste masivo entre pares de prompts dañinos y benignos, y se elimina de las proyecciones de salida de atención y de MLP con un kernel (banda o uniforme) centrado en la capa donde el rechazo separa mejor, con anchura y fuerza máximas buscadas.

El pipeline del autor introduce varias correcciones sobre la receta estándar: gemelos benignos estructuralmente emparejados para aislar la decisión de rechazo de tema, longitud y registro; eliminación de la media benigna de la dirección antes de proyectar, con restauración opcional de norma; extracción de un subespacio de rango k vía SVD sobre el contraste emparejado; y una función objetivo que combina rechazo, KL, caída de calibración y sobre-rechazo, optimizada con Optuna. Opcionalmente se aplica una pasada de autodestilación para "curar" la edición elegida contra logits cacheados del modelo intacto. No se documentan en la información disponible los datos de preentrenamiento ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones heredadas de Qwen3-4B.
- Cumplimiento sustancialmente mayor ante prompts dañinos (menor tasa de rechazo), según la metodología del autor.
- Preservación declarada de comportamientos calibrados: rechazo de premisas falsas, admisión de ignorancia, rechazo de sinsentidos y respeto de restricciones negativas.
- Compatibilidad con llama.cpp, Ollama y LM Studio mediante GGUF.
- Soporte de plantilla de chat conversacional (`-cnv` en llama.cpp, `Modelfile` para Ollama).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio para esta build.

## Casos de uso

- Investigación en interpretabilidad: estudiar la dirección de rechazo y su subespacio comparando las salidas del modelo abliterated con el Qwen3-4B original, usando los artefactos `extract.json` y `search.json` como referencia reproducible.
- Evaluación de métodos de abliteración: servir como punto de comparación frente a Heretic u OBLITERATUS en un mismo harness con juez externo (Qwen3Guard-Gen-8B), midiendo rechazo, cumplimiento, sobre-rechazo y KL.
- Despliegue local en hardware de consumo: el archivo Q4_K_M (2,5 GB) requiere unos 4 GB de VRAM o RAM, por lo que cabe en GPUs de gama media y en portátiles, permitiendo experimentar sin infraestructura dedicada.
- Prototipado de asistentes conversacionales sin filtros de rechazo: útil para probar flujos de diálogo donde los rechazos del modelo base interrumpen la conversación, siempre en entornos controlados y con revisión humana.
- Generación de datos sintéticos para investigación sobre seguridad: producir respuestas a prompts que el modelo base rechazaría, para analizar patrones de cumplimiento y calibrar clasificadores de seguridad.
- Pruebas de robustez y red-teaming interno: usar el modelo como sujeto de evaluación para medir la eficacia de filtros de entrada/salida y de clasificadores de contenido en un pipeline propio.
- Experimentos de cuantización: comparar Q4_K_M frente a Q8_0 para medir la supervivencia de la edición de ablación tras la cuantización, dato que el autor declara registrar en `ablation_card.json`.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de daño entre métodos de abliteración sobre Qwen3-8B (no sobre este modelo de 4 B). Se reproduce parcialmente porque es la única evidencia cuantitativa disponible; el autor indica que el modelo de este repo no participó en ese bake-off y que sus propias cifras de daño están en la tabla de resultados del card, que no se ha proporcionado completa.

| Contender (Qwen3-8B) | Refusal | Comply | Over-refusal | KL | MMLU | ARC-C | GSM8K |
|---|---|---|---|---|---|---|---|
| base | 0,954 | 0,004 | 0,370 | 0,000 | 0,757 | 0,560 | 0,892 |
| Heretic 1.4.0 | 0,610 | 0,273 | 0,050 | 0,006 | 0,757 | 0,558 | 0,898 |
| OBLITERATUS | no disponible (tabla truncada en la información) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks específicos de Qwen3-4B-abliterated-v2 en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~4 GB para Q4_K_M (2,5 GB de archivo) y aproximadamente el doble para Q8_0 (4,3 GB de archivo).
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM para Q4_K_M; para Q8_0 se recomienda ≥6-8 GB. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 4 GB o más; también puede ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 8192 -cnv`), Ollama (mediante el `Modelfile` del repo), LM Studio (`lms import`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refusal (Qwen3-8B, referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-abliterated-v2 (este) | ~4,02 B | no disponible | no disponible para 4 B | Apache 2.0 | GGUF en HF |
| Qwen/Qwen3-4B (base) | ~4,02 B | no disponible | referencia base (0,954 en 8 B) | Apache 2.0 | safetensors en HF |
| Heretic 1.4.0 (sobre Qwen3-8B) | ~8 B | no disponible | 0,610 | según modelo base | herramienta pública |
| OBLITERATUS (sobre Qwen3-8B) | ~8 B | no disponible | no disponible (tabla truncada) | según modelo base | repositorio público |

La comparación directa con alternativas de 4 B abliterated no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente la dirección de rechazo: puede producir contenido dañino, ilegal o inseguro. No debe desplegarse en producción orientada a usuarios sin filtros externos y revisión humana.
- Riesgo de alucinación heredado del modelo base, no cuantificado en la información disponible.
- La model card solo declara inglés; el rendimiento en castellano u otros idiomas no está verificado.
- La longitud de contexto efectiva no se documenta; el ejemplo usa 8192 tokens, pero no se confirma el máximo soportado.
- El autor advierte que la receta estándar de abliteración daña comportamientos calibrados (rechazo de premisas falsas, admisión de ignorancia) y que la comprobación KL habitual no lo detecta; aunque este pipeline declara protegerlos, no se aportan métricas de calibración para este modelo de 4 B en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías de seguridad recae en el desplegador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El checkpoint bf16 editado no se publica en este repo; solo las cuantizaciones GGUF, lo que limita la reproducibilidad fina de la ablación.
- La tabla de benchmarks del card está truncada en la información disponible y corresponde a Qwen3-8B, no a este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/Qwen3-4B-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Heretic (herramienta de abliteración comparada): no disponible en la información proporcionada
- OBLITERATUS (herramienta de abliteración comparada, commit `461ff08`): no disponible en la información proporcionada
- Qwen3Guard-Gen-8B (juez de evaluación): no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada

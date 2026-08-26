# johndpope/open-rvq-encoder-minimax-music3

## Resumen

`open-rvq-encoder-minimax-music3` es un conjunto de codificadores de audio de código abierto desarrollados por la comunidad (autor `johndpope`, con contribuciones del ecosistema SimpleTuner) para reconstruir los códigos RVQ internos que MiniMax Music 3 genera a partir de texto y letras. MiniMax no publicó el codificador original de audio-a-código, por lo que este proyecto proporciona una ruta aproximada que convierte una grabación de referencia en los códigos acústicos de ocho niveles que el modelo de lenguaje de MiniMax Music 3 consume como condición.

La versión recomendada (v4) alcanza un **0,8748 de coseno medio de condición-replay** en 130 pistas de evaluación retenidas, lo que significa que recupera la mayor parte de la señal de condicionamiento que el modelo de difusión recibiría de los códigos originales. El proyecto comenzó con una prueba comunitaria de 41M de parámetros en una sola GPU con 0,6633 de coseno, y evolucionó a través de experimentos de anchura, alineación con características musicales MERT y un decodificador acústico causal autoregresivo a través de la profundidad RVQ.

La arquitectura final (v4) usa un codificador compartido de 169M de parámetros, con un decodificador acústico causal que condiciona cada codebook acústico `k` sobre el código semántico y los codebooks `< k`. Se distribuyen cuatro versiones con distintos tamaños (41M, 155M y 169M) y configuraciones, junto con adaptadores para ComfyUI y Diffusers que permiten restringir los tokens semánticos generados a los candidatos del codificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador compartido + cabezas RVQ independientes (v1-v3) o decodificador acústico causal (v4) |
| Parametros totales | v1: 40.978.944; v2/v3: 154.736.064; v4: 169.008.576 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (términos de MiniMax Music 3) |
| Formato de pesos | safetensors (con archivos `.json` de configuración) |

## Arquitectura y entrenamiento

La arquitectura de los codificadores RVQ se diseñó para convertir latentes de audio (denominados DAV) en ocho códigos enteros por cada frame de 25 Hz, replicando el espacio de códigos RVQ de MiniMax Music 3. La v1 usa un codificador compartido de 512 de anchura con ocho cabezas independientes (una semántica y siete acústicas), entrenada con pérdida KL del top-50 del profesor más entropía cruzada dura, inicialización μP y transferencia de forma μTransfer, con entrenamiento DDP sobre el corpus de destilación inversa. La v2 aumentó la anchura a 1.088 (155M de parámetros) y usó decay polinómico con warm-up. La v3 añadió una pérdida de alineación coseno con características MERT congeladas (solo durante el entrenamiento, sin dependencia en inferencia) que se anuló gradualmente. La v4 sustituyó las cabezas acústicas independientes por un decodificador causal: cada codebook `k` se condiciona sobre el código semántico y los codebooks `< k`, lo que mejoró el coseno de replay de 0,7698 a 0,8748. El dataset de entrenamiento es `bghira/minimax-music3-rvq-reverse-distillation`.

## Capacidades

- Conversión de audio de referencia en códigos RVQ de 8 niveles compatibles con MiniMax Music 3.
- Reconstrucción de la señal de condicionamiento que el modelo de difusión recibe (coseno de replay de 0,8748 en v4).
- Soporte de inferencia con adaptadores para ComfyUI y Diffusers.
- Restricción configurable del token semántico generado: cada quinto token `c0` se limita a los top-5 candidatos del codificador (intervalo configurable de 1 a 10).
- El codificador v4 usa un decodificador acústico causal que condiciona cada codebook acústico sobre los anteriores, mejorando la coherencia entre niveles.
- No requiere dependencias externas adicionales (MERT solo se usa en entrenamiento, no en inferencia).

## Casos de uso

- **Recreación de canciones con MiniMax Music 3**: el codificador permite usar una grabación de referencia como condición para que MiniMax Music 3 genere una versión nueva de la canción (covers). El repositorio `bghira/minimax-music3-rvq-reference-audio` documenta ejemplos de este flujo.
- **Estilización musical**: se puede tomar una pista existente, extraer sus códigos RVQ y usarlos como condición para generar variaciones con la misma estructura y estilo pero con letras o descripciones diferentes.
- **Investigación de condicionamiento por referencia**: el modelo permite estudiar cómo los códigos RVQ influyen en la generación de música, comparando la condición original con la reconstruida.
- **Fine-tuning de MiniMax Music 3**: los códigos reconstruidos pueden usarse para crear datasets de entrenamiento con pares audio-código, ampliando el corpus de destilación inversa.
- **Producción musical asistida**: productores pueden usar una maqueta o demo como referencia para que MiniMax Music 3 la complete con arreglos, mezcla y producción completa.
- **Experimentos de transferencia de estilo**: el codificador permite separar la condición semántica de la acústica, lo que habilita transferir la textura sonora de una pista a otra.

## Benchmarks y rendimiento

| Modelo | Parámetros | Coseno condición-replay (media por pista) |
|---|---|---|
| v1 (cabezas independientes, checkpoint final evaluado) | 40.978.944 | 0,7624 |
| v1 (checkpoint recomendado en tarjeta, paso 17.500) | 40.978.944 | no disponible |
| v2 (cabezas independientes, anchura 1.088) | 154.736.064 | 0,7698 |
| v3 (v2 + alineación MERT solo entrenamiento) | 154.736.064 | 0,7703 |
| v4 (decodificador acústico causal, recomendado) | 169.008.576 | **0,8748** |
| Control: códigos muestreados reales | - | 0,9999 |

La métrica es el coseno medio entre las condiciones de replay y las condiciones almacenadas en el conjunto de evaluación (130 registros de alineación exacta del split retenido). No es precisión de token exacta ni una puntuación de calidad de audio. El conjunto de evaluación y las estadísticas completas están en `evaluation/condition-replay-aggregate.json`. No se han publicado resultados de benchmarks de tareas generales (MMLU, HumanEval, etc.) porque el modelo es un codificador de audio específico.

## Requisitos de hardware

- **v1 (41M)**: entrenable en una sola GPU (prueba comunitaria de `Serveurperso`). Inferencia ligera, cabe en GPUs de consumo.
- **v2/v3 (155M)**: inferencia en GPU de consumo (RTX 3060 o superior) con suficiente VRAM para el lote. Entrenamiento requiere GPU con al menos 24 GB VRAM (recomendado A100 o RTX 4090).
- **v4 (169M)**: similar a v2/v3 en requisitos de inferencia; entrenamiento en GPU de 24-40 GB VRAM.
- **Despliegue**: los pesos están en formato safetensors y se integran con ComfyUI y Diffusers. No se menciona soporte para vLLM, llama.cpp ni Ollama, ya que es un codificador de audio, no un LLM.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Métrica | Licencia |
|---|---|---|---|---|
| `open-rvq-encoder-minimax-music3` (v4) | 169M | Codificador RVQ para MiniMax Music 3 | 0,8748 coseno replay | other (MiniMax Music 3 terms) |
| `open-rvq-encoder-minimax-music3` (v1) | 41M | Codificador RVQ | 0,7624 coseno replay | other |
| `Mothersuperior/open-rvq-encoder-minimax-music3-169m-pooled-v4` | 169M | Fine-tune sobre pooled corpus | 0,8748 (base) / mejorado | other |

No se dispone de información sobre codificadores RVQ comparables de otros fabricantes para MiniMax Music 3. La comparativa se limita a las versiones del mismo proyecto.

## Limitaciones y advertencias

- **No es una precisión de token exacta**: el coseno de replay no indica que los códigos reconstruidos coincidan exactamente con los originales; el espacio RVQ es redundante y tuplas diferentes pueden producir condiciones casi equivalentes.
- **No es una puntuación de calidad de audio**: el coseno mide la similitud de la condición, no la calidad percibida de la música generada.
- **Dependencia de la ruta de MiniMax**: el modelo solo es útil junto con MiniMax Music 3; no genera música de forma autónoma.
- **Licencia restrictiva**: la licencia es `other` (términos de MiniMax Music 3), que puede imponer restricciones de uso comercial. Revisar los términos exactos.
- **Idiomas**: no se indica qué idiomas soporta el codificador; la documentación no ofrece datos al respecto.
- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero al ser un codificador entrenado en un corpus concreto, puede tener sesgos de género musical o de calidad de audio.
- **Cuidado con el uso de covers**: el sistema de referencia-audio puede usarse para crear versiones de canciones con derechos de autor; verificar la legalidad de cada uso.
- **Limitación de reproducción**: el método de replay está diseñado para el flujo de referencia de MiniMax Music 3; no es un codificador universal de audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johndpope/open-rvq-encoder-minimax-music3
- Codificador v1 (41M): https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3-41m-v1
- Codificador v2 (155M): https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3-155m-v2
- Codificador v3 (155M): https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3-155m-v3
- Repo de referencia-audio: https://github.com/bghira/minimax-music3-rvq-reference-audio
- Repo de latent-replanner: https://github.com/bghira/minimax-music3-latent-replanner
- Log de experimentos de replanificación: https://huggingface.co/terminusresearch/minimax-music3-replanner-experiment
- Quickstart de SimpleTuner: https://github.com/bghira/SimpleTuner/blob/main/documentation/quickstart/MINIMAX_MUSIC.md
- Repo principal de MiniMax Music 3: https://github.com/MiniMax-AI/MiniMax-Music3
- Blog oficial de MiniMax Music 3.0: https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model
- Modelo pooled-v4 (Mothersuperior): https://huggingface.co/Mothersuperior/open-rvq-encoder-minimax-music3-169m-pooled-v4

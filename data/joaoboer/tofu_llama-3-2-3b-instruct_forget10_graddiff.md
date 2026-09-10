# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_GradDiff

## Resumen

`tofu_Llama-3.2-3B-Instruct_forget10_GradDiff` es un artefacto de investigación en *machine unlearning* (desaprendizaje) construido por el usuario JoaoBoer a partir de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez es un ajuste fino de Llama-3.2-3B-Instruct sobre el dataset TOFU completo. El modelo aplica el método **GradDiff** sobre la partición `forget10` del benchmark TOFU, con el objetivo de eliminar de los pesos la información asociada al 10 % de autores ficticios designados como conjunto a olvidar, manteniendo la utilidad sobre el resto.

El resultado es un modelo denso de 3.212.749.824 parámetros con licencia Llama 3.2, pesos en safetensors y tamaño de repositorio de 6,4 GB, pensado como *baseline* de desaprendizaje a nivel de pesos y como modelo *draft* en el proyecto Speculative-Decoding-Unlearning. No es un modelo de propósito general listo para producción: es una pieza de evaluación académica con métricas TOFU publicadas y sin validación comunitaria (0 descargas y 0 *likes* en el momento de la consulta).

Su relevancia actual es doble: por un lado permite reproducir y comparar el *baseline* clásico de GradDiff frente a métodos más modernos dentro del framework `open-unlearning`; por otro, sirve para estudiar hasta qué punto el desaprendizaje por diferencia de gradientes realmente borra información, dado que sus propias métricas indican una fuga de privacidad elevada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2), con Grouped-Query Attention y RoPE, heredada del modelo base |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | 128.000 tokens en el modelo base Llama-3.2-3B-Instruct; no verificado en la model card del modelo desaprendido |
| Tipos de cuantizacion | El repositorio solo publica pesos sin cuantizar (safetensors). No se distribuyen variantes GGUF, GPTQ ni AWQ; son generables externamente con llama.cpp, AutoGPTQ o AutoAWQ |
| Idiomas soportados | no disponible en la model card; el modelo base Llama-3.2-3B-Instruct declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Dataset de desaprendizaje | locuslab/TOFU, particion `forget10` |
| Framework de entrenamiento | open-unlearning (Loss/.hydra/config.yaml, salidas en evals/) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 3,21 mil millones de parámetros, con atención de consultas agrupadas (GQA) y codificación posicional rotatoria, sin mezcla de expertos ni capas recurrentes. El modelo de partida, `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, fue ajustado sobre el conjunto TOFU completo, compuesto por perfiles sintéticos de autores ficticios con pares pregunta-respuesta, de modo que el modelo memoriza deliberadamente esa información antes del desaprendizaje.

Sobre ese punto de partida se aplica **GradDiff**, un método de desaprendizaje por diferencia de gradientes que combina una componente de ascenso de gradiente sobre la partición `forget10` con una componente de descenso de gradiente (pérdida NLL) sobre el conjunto *retain*, de forma que el modelo pierda la información olvidada sin degradar el resto. Los hiperparámetros declarados en la model card son `gamma: 1.0`, `alpha: 5` y `retain_loss_type: NLL`. El entrenamiento se realizó con el framework `open-unlearning` y la configuración completa queda registrada en `.hydra/config.yaml`, con las evaluaciones volcadas en `evals/`. No hay innovaciones arquitectónicas propias: la contribución es metodológica y experimental, no estructural.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del ajuste de Llama-3.2-3B-Instruct.
- Respuesta a preguntas de dominio general, con la advertencia de que la utilidad medida en TOFU cae a 0,6054 tras el desaprendizaje.
- Soporte de *tool calling* y *function calling* en el modelo base Llama 3.2; no se valida específicamente en esta variante desaprendida.
- Razonamiento multi-paso y uso como modelo *draft* en esquemas de decodificación especulativa dentro del proyecto del autor.
- Capacidad multilingüe heredada del modelo base (ocho idiomas declarados por Meta), no confirmada en la model card.
- No dispone de visión, audio ni *thinking mode*: Llama 3.2 en tamano 3B es un modelo exclusivamente de texto.
- Capacidad instrumental para investigación: reproducir el *baseline* GradDiff y servir de referencia en evaluaciones de *membership inference*.

## Casos de uso

- **Investigación en desaprendizaje (baseline GradDiff)**: permite reproducir el resultado de referencia del método de diferencia de gradientes sobre `forget10` y compararlo con alternativas como NPO, SimNPO o RMU dentro del mismo framework `open-unlearning`.
- **Modelo *draft* en decodificación especulativa**: el autor lo emplea como modelo borrador en el proyecto Speculative-Decoding-Unlearning, donde un modelo pequeno propone tokens que un modelo mayor verifica, un escenario en el que su tamano de 3,21 mil millones de parámetros es adecuado.
- **Auditoría de privacidad y ataques de inferencia de pertenencia**: sus métricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` lo convierten en un sujeto de prueba para medir cuánta información del conjunto olvidado sigue siendo recuperable.
- **Evaluación de cumplimiento normativo (derecho al olvido)**: sirve para estudiar, en entorno controlado y con datos sintéticos, si el borrado a nivel de pesos satisface requisitos tipo RGPD antes de plantear técnicas similares sobre datos reales.
- **Comparación de métodos de *unlearning* a igualdad de modelo base**: al compartir punto de partida con otras variantes del ecosistema `open-unlearning`, permite aislar el efecto del algoritmo sin confundirlo con diferencias de arquitectura o de datos.
- **Generación de texto conversacional de bajo coste**: con cuantización INT4 cabe en GPUs de gama media y puede usarse para prototipos de chat, siempre que se acepte que su calidad conversacional no ha sido re-validada tras el desaprendizaje.
- **Destilación y ajuste fino posterior**: su tamano reducido lo hace apto como punto de partida para experimentos de destilación o de recuperación de capacidades (*relearning*), un caso de estudio habitual para medir la fragilidad del desaprendizaje.
- **Docencia y experimentación académica**: por su licencia permisiva y su bajo requisito de hardware, es utilizable en cursos y laboratorios para ilustrar el ciclo completo de memorización, olvido y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, ARC) en la información disponible. Las únicas métricas publicadas son las de la evaluación TOFU, volcadas en el directorio `evals/` del repositorio:

| Metrica TOFU | Valor |
|---|---|
| exact_memorization | 0,0221 |
| extraction_strength | 0,0325 |
| forget_Q_A_PARA_Prob | 0,0000 |
| forget_Q_A_gibberish | 0,2874 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,0005 |
| mia_loss | 0,0041 |
| mia_min_k | 0,0049 |
| mia_min_k_plus_plus | 0,0139 |
| mia_zlib | 0,0138 |
| model_utility | 0,6054 |
| privleak | 64,2205 |

Lectura de los datos: los valores muy bajos en `forget_Q_A_PARA_Prob` (0,0000), `forget_truth_ratio` (0,0005) y `exact_memorization` (0,0221) indican que el modelo apenas reproduce las respuestas del conjunto olvidado. Sin embargo, `privleak` se situa en 64,2205, un valor elevado que apunta a fuga de privacidad residual, y `model_utility` cae a 0,6054 respecto al modelo completo, lo que sugiere un coste de utilidad no despreciable. No se dispone de resultados comparativos con otras variantes en la informacion proporcionada.

## Requisitos de hardware

- **Pesos en BF16/FP16**: aproximadamente 6,4 GB, coincidiendo con el tamano del repositorio. Es la configuracion nativa del checkpoint.
- **Pesos en FP32**: en torno a 12,8 GB, solo recomendable para depuracion o analisis de pesos.
- **Pesos en INT8**: aproximadamente 3,2 GB.
- **Pesos en INT4**: entre 1,8 y 2,0 GB, mas el coste de la cache KV.
- **Cache KV**: crece linealmente con el contexto y con GQA en el modelo base; con contextos de 128.000 tokens puede superar en varios gigabytes el tamano de los pesos, por lo que conviene limitar la ventana en despliegues con poca VRAM.
- **GPU de consumo compatibles**: cabe en BF16 en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) siempre que se acote el contexto; con cuantizacion INT4 es viable en tarjetas de 8 GB.
- **GPU de datacenter**: L4, A10G, A100 40/80 GB y H100 sin problemas, con margen amplio para lotes grandes.
- **Opciones de despliegue**: `transformers` (libreria declarada en el repositorio), vLLM, TGI, SGLang, llama.cpp y Ollama previa conversion a GGUF.
- **Latencia y throughput**: no se han publicado mediciones en la informacion disponible. Como referencia orientativa y no verificada, un modelo denso de 3,2 mil millones de parametros en BF16 sobre una RTX 4090 suele situarse en el orden de decenas a un centenar de tokens por segundo con vLLM, pero este dato no procede de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_GradDiff | 3,21 mil millones | 128.000 tokens (heredado) | Denso, desaprendido con GradDiff sobre `forget10` | llama3.2 | HuggingFace, pesos safetensors |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 mil millones | 128.000 tokens | Denso, ajustado sobre TOFU completo (sin desaprender) | llama3.2 | HuggingFace, es el modelo base de esta ficha |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Denso, instruct generalista | llama3.2 | HuggingFace, con amplia adopcion |
| Otras variantes de open-unlearning sobre el mismo base (NPO, SimNPO, RMU, etc.) | 3,21 mil millones | 128.000 tokens | Denso, desaprendido con otro algoritmo | llama3.2 | HuggingFace, dentro del ecosistema open-unlearning |

La diferencia entre esta ficha y el modelo base no esta en parametros, contexto ni licencia, sino exclusivamente en los pesos y en el objetivo de olvido. Frente a Llama-3.2-3B-Instruct, pierde utilidad general a cambio de reducir la reproduccion del conjunto olvidado, con un `privleak` de 64,2205 que indica que ese olvido es incompleto. No se dispone de cifras publicadas para comparar el rendimiento relativo frente a NPO, SimNPO o RMU en la informacion proporcionada.

## Limitaciones y advertencias

- **Fuga de privacidad residual elevada**: `privleak` = 64,2205 es un valor alto e indica que el modelo no ha olvidado de forma fiable el conjunto `forget10`; no debe tratarse como un desaprendizaje efectivo.
- **Coste de utilidad**: `model_utility` = 0,6054, inferior al del modelo completo, lo que implica degradacion de capacidades generales tras el proceso.
- **Olvido fragil**: `forget_Q_A_gibberish` = 0,2874 sugiere que en una fraccion relevante de casos la respuesta al conjunto olvidado no se elimina limpiamente, sino que degenera en texto incoherente.
- **Riesgo de recuperacion por ajuste fino**: el desaprendizaje por diferencia de gradientes es conocido por poder revertirse con un ajuste fino posterior sobre datos del conjunto olvidado; los resultados deben interpretarse en ese contexto.
- **Dominio limitado del benchmark**: TOFU trabaja con perfiles de autores ficticios y sinteticos. Las conclusiones no son extrapolables directamente a datos personales reales ni a escenarios de produccion.
- **Sesgos heredados**: el modelo arrastra los sesgos de Llama-3.2-3B-Instruct; no se ha realizado ninguna evaluacion de sesgo especifica sobre esta variante.
- **Alucinacion**: el riesgo de alucinacion del modelo base se mantiene, y la degradacion inducida por el desaprendizaje puede agravarlo en dominios afectados.
- **Licencia Llama 3.2**: uso comercial permitido bajo las condiciones de la Llama 3.2 Community License, con obligacion de atribucion ("Built with Llama"), requisitos de nomenclatura para trabajos derivados y el limite de 700 millones de usuarios mensuales.
- **Sin validacion comunitaria**: 0 descargas y 0 *likes*, sin issues ni evaluaciones de terceros. Es un artefacto de investigacion, no un modelo soportado.
- **Idiomas no documentados**: la model card no declara idiomas soportados; el soporte multilingue es una herencia no verificada del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget10_GradDiff
- Modelo base (TOFU completo): https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Perfil del autor en HuggingFace: https://huggingface.co/JoaoBoer
- Modelo original Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Articulo TOFU (referencia del benchmark): https://arxiv.org/abs/2401.06121

Nota: la busqueda web realizada no devolvio resultados utiles (unicamente paginas de inicio de motores de busqueda), por lo que todos los enlaces anteriores proceden de la model card y del repositorio del modelo.

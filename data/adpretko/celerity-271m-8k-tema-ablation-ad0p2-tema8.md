# adpretko/celerity-271m-8k-tema-ablation-ad0p2-tema8

## Resumen

Celerity 271M 8K — TEMA ablation — ad0.2_tema_mult8 es un checkpoint de 271 millones de parámetros perteneciente a la familia Celerity, publicado por el usuario adpretko en Hugging Face. Se trata de una conversión desde el formato nativo de Cerebras CS al formato Hugging Face, y forma parte de una serie de experimentos de ablación sobre hiperparámetros de entrenamiento. El modelo trabaja con una longitud máxima de secuencia de 8192 tokens y emplea ALiBi como codificación posicional.

Este checkpoint concreto corresponde al experimento `ad0.2_tema_mult8`, en el que se fija la tasa de aprendizaje en 0.15 y el tamaño de lote global en 48, variando el multiplicador de tau-EMA hasta 8 veces el valor de referencia de 0.1745 (tau_ema final de 1.396), con un ajuste proporcional del weight decay. La tasa de attention dropout se establece en 0.2 con programación constante. No se trata, por tanto, de un modelo pensado para producción, sino de una pieza de un estudio comparativo de hiperparámetros.

Su relevancia es fundamentalmente metodológica: permite reproducir y comparar el efecto del tau-EMA y del attention dropout dentro de la familia Celerity, junto a otros checkpoints hermanos como `celerity-271m-8k-ad0p1`, `celerity-271m-8k-residual-dropout-0p2` o las variantes de 504M y 906M. El repositorio ocupa 0.5 GB, no registra descargas ni likes, y no incluye licencia, idiomas ni resultados de evaluación declarados.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no confirmada; los hiperparámetros publicados (ALiBi, attention dropout, residual dropout, LayerDrop) apuntan a un transformer decoder |
| Parámetros totales | 271 M (según el nombre del modelo) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (maximum sequence length durante el entrenamiento) |
| Codificación posicional | ALiBi |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint convertido a formato Hugging Face; el repositorio ocupa 0.5 GB) |
| Carga del modelo | requiere `trust_remote_code=True` (código de modelado propio de Celerity) |
| Runtime de origen | cbcore 2.6.0 (Cerebras) |
| Tamaño del repositorio | 0.5 GB |
| Fecha de creación | 2026-10-04 |
| Fecha de actualización | 2026-10-04 |

## Arquitectura y entrenamiento

La model card no describe explícitamente la arquitectura interna, pero los hiperparámetros documentados permiten acotarla con razonable certeza: uso de ALiBi como tipo de position embedding, attention dropout, residual dropout y LayerDrop, junto con un steep de entrenamiento por pasos sobre secuencias de hasta 8192 tokens. Este conjunto de elementos es característico de un transformer decoder de tipo causal. El checkpoint se generó con el runtime cbcore 2.6.0 de Cerebras y se convirtió posteriormente al formato Hugging Face mediante el commit de conversión `0e3d5d375695293479df9d2a3717f05f71a345b4`. El modelo utiliza código de modelado propio de Celerity, por lo que debe cargarse con `trust_remote_code=True`.

Los detalles de entrenamiento documentados son: experimento `ad0.2_tema_mult8`, checkpoint de origen `checkpoint_13773.mdl`, 13773 pasos de entrenamiento, batch global de 48 y batch de validación de 32, tasa de aprendizaje máxima de 0.15, weight decay de 0.00034673267902102944, attention dropout de 0.2 con programación constante, residual dropout de 0.0, stochastic depth de 0.0 y LayerDrop de 0.0. El eje del experimento es el multiplicador de tau-EMA: 8 veces el valor de referencia 0.1745, lo que da un tau_ema de 1.396. No se especifica la composición del dataset, el número total de tokens vistos, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos, etc.).

## Capacidades

- No hay ninguna capacidad documentada explícitamente en la model card ni en la información de la ficha de Hugging Face.
- Por la naturaleza del entrenamiento (secuencias de hasta 8192 tokens con ALiBi) es presumible que se trate de un modelo de lenguaje autorregresivo, pero este extremo no se confirma en la documentación disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo de pensamiento, visión, audio, etc.): no disponible.
- Al ser un checkpoint de ablación con fines de investigación, no se declara ningún ajuste por instrucciones ni alineación conversacional.

## Casos de uso

- Reproducción de experimentos de ablación: el checkpoint permite replicar el punto `ad0.2_tema_mult8` del barrido de tau-EMA y comparar su comportamiento con el resto de variantes de la familia Celerity bajo condiciones idénticas de evaluación.
- Estudio del efecto del attention dropout: con una tasa fija de 0.2 y programación constante, sirve para aislar el impacto de este hiperparámetro frente a los checkpoints `ad0p1` y las variantes de residual dropout.
- Evaluación comparativa intra-familia: al compartir tokenizador, arquitectura base y contexto de 8192 tokens con los modelos de 271M, 504M y 906M de la misma serie, es útil para trazar curvas de escalado y de sensibilidad a hiperparámetros.
- Punto de partida para fine-tuning experimental: con 271M de parámetros y un repositorio de 0.5 GB, cabe en una GPU de consumo y permite probar recetas de ajuste (SFT, LoRA) a bajo coste antes de trasladarlas a variantes mayores.
- Pruebas de pipelines de conversión y carga: al requerir `trust_remote_code=True` y provenir de una conversión desde el formato CS de Cerebras, es útil para validar flujos de carga personalizados en `transformers` y detectar problemas de compatibilidad.
- Experimentos con contexto largo: su ventana de 8192 tokens y el uso de ALiBi lo hacen adecuado para estudiar degradación de rendimiento según la posición dentro de la secuencia en modelos pequeños.
- Docencia y formación: sirve como ejemplo práctico de checkpoint de ablación con metadatos completos de entrenamiento, útil en cursos sobre entrenamiento de transformers y metodología experimental.
- Inferencia local en hardware modesto: su tamaño permite ejecutarlo en portátiles con GPU integrada o CPU para pruebas de latencia y de consumo de memoria, sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación, y tampoco hay comparaciones numéricas con modelos similares.

## Requisitos de hardware

- Estimación de VRAM para pesos en inferencia (cálculo propio a partir de 271 M de parámetros): aproximadamente 1,1 GB en FP32, 0,55 GB en FP16/BF16, 0,28 GB en INT8 y 0,15 GB en INT4.
- A esas cifras hay que sumar la memoria de activaciones y la caché KV para secuencias de hasta 8192 tokens; el consumo exacto no está disponible porque no se documentan el número de capas, cabezas ni dimensión oculta.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para FP16 en contextos moderados. Una RTX 3060, RTX 4060, RTX 4070 o RTX 4090 ejecutan el modelo con holgura; también cabe en GPUs de datacenter como A100 o H100, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier modelo con 6 GB o más de VRAM; para cuantizaciones de 4 bits bastarían 2-3 GB.
- Inferencia en CPU: factible, aunque la latencia no está documentada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No hay confirmación de soporte en vLLM, llama.cpp, Ollama, TGI ni otras herramientas, y la dependencia de código propio hace que su integración no sea directa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Codificación posicional | Licencia | Notas |
|---|---|---|---|---|---|
| celerity-271m-8k-tema-ablation-ad0p2-tema8 | 271 M | 8192 | ALiBi | no disponible | Ablación de tau-EMA (mult. 8, tau_ema 1.396) con attention dropout 0.2 |
| celerity-271m-8k-ad0p1 | 271 M | 8192 (según el nombre) | no disponible | no disponible | Variante de la misma familia con attention dropout 0.1 |
| celerity-271m-8k-residual-dropout-0p2 | 271 M | 8192 (según el nombre) | no disponible | no disponible | Checkpoint de depuración/ablación con residual dropout 0.2 |
| celerity-271m-8k-residual-dropout-0p4 | 271 M | 8192 (según el nombre) | no disponible | no disponible | Checkpoint de depuración/ablación con residual dropout 0.4 |
| celerity-504m-8k-ad0p4-ild | 504 M | 8192 (según el nombre) | no disponible | no disponible | Escalado a 504 M con attention dropout 0.4 e ILD |
| celerity-906m-8k-ad0p1 | 906 M | 8192 (según el nombre) | no disponible | no disponible | Escalado a 906 M (repositorio de 1,82 GB) |

No se dispone de benchmarks que permitan comparar el rendimiento entre estos modelos; la comparación disponible se limita a parámetros, contexto declarado en el nombre y configuración de entrenamiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas de perplexity ni validación cualitativa publicada, por lo que se desconoce la calidad real de las generaciones.
- Riesgo de alucinación: no cuantificado. En modelos de 271 M de parámetros la tasa de afirmaciones incorrectas suele ser elevada, pero no hay datos específicos para este checkpoint.
- Idiomas: no se declara ninguno, por lo que no puede asumirse soporte multilingüe ni siquiera un idioma principal concreto.
- Licencia: no disponible. Sin licencia explícita, el uso comercial queda en un limbo legal y no puede recomendarse para producción.
- Naturaleza experimental: es un checkpoint de ablación con fines de investigación, no un modelo ajustado por instrucciones ni alineado; no debería desplegarse en aplicaciones de cara al usuario.
- Ejecución de código remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código Python arbitrario incluido en el repositorio. Debe auditarse el código antes de usarlo en entornos sensibles.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad.
- Sesgos: no documentados. No hay información sobre la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo de género, raza, idioma o dominio.
- Longitud de contexto: aunque se entrenó con secuencias de 8192 tokens, el rendimiento efectivo en contextos largos no está medido y en modelos pequeños suele degradarse antes de alcanzar el límite teórico.
- Compatibilidad: al depender de código de modelado propio, puede no funcionar en versiones futuras de `transformers` ni en motores de inferencia alternativos.
- Fechas de publicación atípicas (2026) en los metadatos del repositorio; conviene verificar la procedencia antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tema-ablation-ad0p2-tema8
- Variante celerity-271m-8k-ad0p1: https://huggingface.co/adpretko/celerity-271m-8k-ad0p1
- Variante celerity-271m-8k-residual-dropout-0p2: https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p2
- Variante celerity-271m-8k-residual-dropout-0p4: https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p4
- Variante celerity-504m-8k-ad0p4-ild: https://huggingface.co/adpretko/celerity-504m-8k-ad0p4-ild
- Variante celerity-906m-8k-ad0p1: https://huggingface.co/adpretko/celerity-906m-8k-ad0p1/tree/main
- Paper, blog o repositorio oficial de Celerity: no disponible

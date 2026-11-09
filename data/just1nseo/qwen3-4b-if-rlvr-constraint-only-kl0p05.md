# just1nseo/qwen3-4b-if-rlvr-constraint-only-kl0p05

## Resumen

`just1nseo/qwen3-4b-if-rlvr-constraint-only-kl0p05` es una coleccion de checkpoints de ajuste fino derivados de `Qwen/Qwen3-4B`, entrenados con GRPO (Group Relative Policy Optimization) mediante la libreria verl. El objetivo del entrenamiento es mejorar el cumplimiento de instrucciones (instruction following) usando RLVR (Reinforcement Learning with Verifiable Rewards) centrado exclusivamente en restricciones, con un coeficiente de divergencia KL de 0,05 respecto al modelo base. El autor publica cada carpeta `global_step_<N>/` como un modelo completo en bfloat16, lo que permite inspeccionar la evolucion del entrenamiento paso a paso.

El modelo conserva la arquitectura y el tamano del Qwen3-4B original (4 mil millones de parametros, transformer denso), por lo que hereda sus capacidades generales de generacion de texto, razonamiento y codigo, pero con un sesgo hacia el seguimiento estricto de restricciones en las instrucciones. El nombre del run (`nonthink`) sugiere que el entrenamiento se realizo en modo no-thinking, es decir, sin la fase de razonamiento extendido que Qwen3 puede activar opcionalmente.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin idiomas especificados. Su interes es acotado: sirve como referencia para quienes experimentan con RLVR y GRPO sobre modelos pequenos de la familia Qwen3, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (checkpoints publicados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B`, un transformer denso de 4 mil millones de parametros. Sobre esa base se aplico un ajuste con GRPO, un algoritmo de optimizacion por politica que estima ventajas relativas dentro de un grupo de respuestas muestreadas para una misma instruccion, evitando la necesidad de un modelo critico separado. El entrenamiento se ejecuto con verl, el framework de RL para modelos de lenguaje de Volcengine, y utiliza RLVR: recompensas verificables programaticamente en lugar de un reward model aprendido.

El run se denomina `qwen3_4b_grpo_nonthink_constraint_only_b1024_c1_kl0p05`, lo que indica: modo non-think (sin cadena de razonamiento extendida), senal de recompensa centrada solo en restricciones (`constraint_only`), batch de 1024 (`b1024`), un parametro `c1` no documentado y coeficiente KL de 0,05 frente a la politica de referencia. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de instrucciones ni el esquema exacto de recompensas verificables.

Cada carpeta `global_step_<N>/` contiene un checkpoint completo en bfloat16 exportado por verl, lo que permite cargar cualquier paso intermedio con `from_pretrained(..., subfolder="global_step_91")`. Esta organizacion es habitual en experimentos de RL y facilita el analisis de la curva de aprendizaje y del olvidocatastrofico respecto al base.

## Capacidades

- Generacion de texto autoregresiva en el mismo rango de tareas que Qwen3-4B.
- Cumplimiento de instrucciones con restricciones explicitas (formato, longitud, inclusion/exclusion de terminos), objetivo directo del entrenamiento RLVR.
- Razonamiento y matematicas basicas heredadas del modelo base, aunque el entrenamiento se realizo en modo non-think.
- Generacion de codigo, limitada por el tamano de 4B y por el sesgo del ajuste hacia el seguimiento de restricciones.
- Soporte multilingue heredado del base, aunque no se declaran idiomas en la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion en RLVR: cargar distintos `global_step_<N>` para estudiar como evoluciona el cumplimiento de restricciones a lo largo del entrenamiento y comparar con el base Qwen3-4B.
- Evaluacion de GRPO con verl: usar el run como referencia reproducible de un pipeline GRPO con KL fijo a 0,05 y recompensa solo de restricciones.
- Generacion con formato estricto: tareas donde la salida debe respetar plantillas, longitudes maximas o listas de terminos permitidos, aprovechando el sesgo del ajuste.
- Extraccion de datos estructurados: prompts que exigen JSON o campos fijos, donde las restricciones verificables son el criterio principal de calidad.
- Baseline para ablaciones: comparar `constraint_only` frente a runs con recompensas mixtas (correccion, estilo, formato) sobre el mismo base.
- Prototipado en local: al ser un modelo de 4B en bfloat16, puede ejecutarse en una sola GPU consumer de gama alta para pruebas de instruction following.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 10-16 GB para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 4-5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB, aunque los checkpoints publicados estan en bfloat16 y habria que cuantizarlos manualmente.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para entrenamiento y evaluacion por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bfloat16.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con contexto limitado, y en GPUs de 12 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo del repo), vLLM y TGI para serving; llama.cpp u Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| just1nseo/qwen3-4b-if-rlvr-constraint-only-kl0p05 | 4B | no disponible | GRPO + RLVR (verl) sobre Qwen3-4B | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | Preentrenamiento + post-entrenamiento de Qwen | Apache 2.0 (segun el base, no verificado aqui) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | SFT + preferencias | Apache 2.0 (segun el base, no verificado aqui) | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | 3B | no disponible en esta ficha | SFT + RLHF | Llama 3.2 Community License | Hugging Face |

La comparacion con benchmarks no es posible porque el autor no publica metricas. Frente al base Qwen3-4B, la diferencia esperada esta en el cumplimiento de restricciones, no en conocimiento general.

## Limitaciones y advertencias

- Model card minima: no hay datos de dataset, numero de pasos, hiperparametros completos ni esquema de recompensas verificables.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o verificar la licencia del base Qwen3-4B por separado.
- Idiomas no declarados: el comportamiento multilingue no esta garantizado ni evaluado.
- Riesgo de sobreajuste al formato: al entrenar solo con recompensas de restricciones, el modelo puede degradar calidad, coherencia o correccion factual respecto al base.
- Riesgo de alucinacion: inherente a modelos de 4B y no mitigado por este ajuste.
- Modo non-think: no se entreno la cadena de razonamiento extendida, por lo que tareas que se beneficien de thinking pueden rendir peor que el Qwen3-4B original en modo thinking.
- Checkpoints intermedios: cada `global_step_<N>` puede tener calidad distinta; no hay indicacion de cual es el paso recomendado.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de mejora frente al base.
- Repo de 16,1 GB con multiples checkpoints: consumo de disco y de ancho de banda considerable para descargar el repositorio completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/just1nseo/qwen3-4b-if-rlvr-constraint-only-kl0p05
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Libreria de entrenamiento verl: https://github.com/volcengine/verl

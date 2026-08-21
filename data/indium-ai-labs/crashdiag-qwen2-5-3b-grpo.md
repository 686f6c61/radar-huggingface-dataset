# Indium-AI-Labs/CrashDiag-Qwen2.5-3B-GRPO

## Resumen

CrashDiag-Qwen2.5-3B-GRPO es un adaptador LoRA desarrollado por Indium AI Labs sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Su propósito es convertir un modelo de lenguaje generalista en un agente especializado en diagnóstico y reparación de fallos de infraestructura: recibe telemetría operativa incompleta y debe emitir un objeto JSON estricto con un workflow de reparación ordenado. El entrenamiento se realizó mediante Group Relative Policy Optimization (GRPO) con recompensas mecánicas calculadas por un sandbox desechable que ejecuta el workflow y verifica el estado resultante, sin ningún evaluador basado en LLM.

La relevancia actual radica en que demuestra un enfoque de aprendizaje por refuerzo aplicado a tareas de operaciones de TI, donde la corrección se mide por la ejecución real de las acciones, no por la plausibilidad del texto. El adaptador es ligero (0.1 GB) y se distribuye bajo licencia MIT, lo que facilita su integración en pipelines de agentes autónomos. El modelo base Qwen2.5-3B-Instruct aporta la arquitectura transformer decoder de 3B parámetros con soporte de contexto de hasta 32K tokens, aunque el adaptador fue entrenado con límites de 1024 tokens de prompt y 96 de completación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-3B-Instruct) + adaptador LoRA |
| Parametros totales | 3B (modelo base) + adaptador LoRA rank 16 (parametros del adaptador no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de prompt / 96 tokens de completacion (limites de entrenamiento); el modelo base soporta 32K |
| Tipos de cuantizacion | No disponible (se distribuye como adaptador PEFT, no como pesos completos) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adapter_model.safetensors) + tokenizer |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen2.5-3B-Instruct, un transformer decoder con atención causal estándar. Sobre este modelo se aplicó un adaptador LoRA de rango 16, alpha 32 y dropout 0.05, dirigido a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó directamente con GRPO, sin etapa previa de supervisión (SFT). La recompensa se calcula ejecutando el workflow generado en un sandbox desechable: el entorno re-despliega la aplicación, ejecuta las acciones permitidas (máximo 8) y verifica el estado final mediante health checks. No se utiliza ningún LLM como evaluador.

El dataset de entrenamiento consta de 6,656 episodios, con 832 episodios held-out para evaluación. Se usaron 4 generaciones por prompt, batch efectivo de 8, learning rate constante de 5e-6 con 5% de warmup, y muestreo con temperatura 1.0 y top-p 0.95. El entrenamiento se ejecutó en BF16 sobre una NVIDIA L4 (24 GB) durante aproximadamente 8.2 horas. La función de recompensa rechaza salidas que no sean JSON estricto durante el entrenamiento.

## Capacidades

- Generación de workflows de reparación en formato JSON estricto, con una lista ordenada de acciones y parámetros.
- Razonamiento multi-paso para diagnosticar fallos a partir de telemetría incompleta, ruidosa o desplazada.
- Integración con entornos de ejecución de agentes: las acciones generadas se pueden parsear y ejecutar en un sandbox.
- Soporte de tool-use restringido al allowlist de acciones declaradas por el entorno CrashDiag (por ejemplo, `restart_app`).
- Capacidad de formateo estricto: el 94.59% de las salidas en evaluación cumplen el formato JSON estricto.
- No es un modelo de propósito general: está especializado en el dominio de infraestructura y no ofrece capacidades de visión, audio ni razonamiento general fuera de su ámbito.

## Casos de uso

- Diagnóstico automatizado de fallos de infraestructura: el modelo recibe telemetría (por ejemplo, `{"gateway": "degraded", "http_family": "5xx"}`) y genera un plan de reparación ordenado, lo que permite integrarlo en sistemas de respuesta autónoma ante incidentes.
- Reparación autónoma en entornos de prueba: al ejecutar el workflow en un sandbox desechable, se puede validar la corrección antes de aplicar cambios en producción, reduciendo el riesgo de intervenciones manuales.
- Asistente para operadores de TI: el modelo puede sugerir secuencias de acciones concretas (reiniciar servicios, ajustar configuraciones) que un humano puede revisar y aprobar antes de ejecutarlas.
- Automatización de runbooks: convierte runbooks estáticos en políticas dinámicas que se adaptan a la telemetría observada, generando pasos específicos según el estado del sistema.
- Evaluación de políticas de reparación: al estar entrenado con recompensas mecánicas, sirve como referencia para comparar estrategias de agentes en entornos simulados de fallos.
- Formación de agentes en entornos de operaciones: el adaptador puede usarse como punto de partida para fine-tuning adicional en dominios similares, gracias a su licencia MIT y su formato PEFT.

## Benchmarks y rendimiento

La evaluación final se realizó sobre 832 episodios held-out, con 52 familias de fallos y 16 variaciones disjuntas por familia, en perfiles redactados, ruidosos y con ruido desplazado. La comparación entre el modelo base y el adaptador se presenta en la siguiente tabla (extraída de la model card):

| Politica | Resolucion exacta | Recompensa media verificada | JSON estricto | Errores de backend |
|---|---:|---:|---:|---:|
| Qwen2.5-3B-Instruct | 1.92% (16/832) | 11.88% | 63.58% | 0.00% |
| CrashDiag GRPO adapter | **27.40% (228/832)** | **41.91%** | **94.59%** | 0.00% |

La resolución exacta requiere que todos los subfallos inyectados sean reparados. La recompensa media verificada es el crédito parcial (`resolved_subfaults / total_subfaults`). Los autores advierten que la comparación no es un ablation controlado: el modelo base usó una demostración de formato genérica y un límite de 64 tokens de generación, mientras que el adaptador no usó demostración y empleó el límite de 96 tokens alineado con el entrenamiento. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB) y se carga junto con el modelo base de 3B parámetros.
- VRAM estimada: con cuantización de 4 bits del modelo base, se puede ejecutar en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Sin cuantización, se recomiendan al menos 8-10 GB.
- GPU recomendada: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM; el entrenamiento se realizó en una NVIDIA L4 (24 GB), pero la inferencia es viable en hardware de consumo.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` (como se muestra en la model card), o integrarse en servidores de inferencia como vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no se han publicado mediciones específicas, pero al tratarse de un modelo de 3B con límite de 96 tokens de salida, la generación es rápida en GPUs modernas (del orden de decenas de milisegundos por token).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CrashDiag-Qwen2.5-3B-GRPO | 3B + LoRA | 1024 prompt / 96 completion | GRPO con recompensa mecanica | MIT | HuggingFace |
| Qwen2.5-3B-Instruct (base) | 3B | 32K | SFT + RLHF | Apache 2.0 | HuggingFace |
| Qwen2.5-3B-Instruct-grpo (chenggong1995) | 3B | No especificado | GRPO (sin detalle) | No especificada | HuggingFace |

No se dispone de datos de rendimiento comparables para otros adaptadores GRPO sobre Qwen2.5-3B. La comparación más relevante es contra el modelo base, que se muestra en la sección de benchmarks. El adaptador CrashDiag está especializado en un dominio concreto, por lo que no es directamente comparable con modelos generalistas de propósito general.

## Limitaciones y advertencias

- El modelo está evaluado únicamente en el sandbox CrashDiag, no en infraestructura de producción real. Su comportamiento en entornos no simulados no está verificado.
- Los resultados provienen de una sola semilla de entrenamiento y un solo modelo base; no hay evidencia de robustez frente a variaciones de inicialización.
- La comparación entre base y adaptador tiene factores de confusión declarados (diferente demostración de formato y límite de tokens), por lo que la mejora observada no es un resultado de ablation controlado.
- El adaptador solo soporta inglés y está restringido al dominio de infraestructura; no es adecuado para tareas generales de generación de texto o razonamiento.
- La salida debe pasar por el parser `crashdiag.agents.parse_workflow` antes de ejecutarse; el entorno limita a 8 acciones y a un allowlist de acciones, por lo que no se deben ejecutar workflows sin validación.
- Aunque la licencia es MIT, el uso en producción requiere integrar el adaptador con el modelo base Qwen2.5-3B-Instruct, que tiene su propia licencia (Apache 2.0). Se debe verificar la compatibilidad de licencias en el despliegue final.
- No se han publicado análisis de sesgos ni de alucinación específicos para este adaptador; al ser un modelo pequeño, puede generar acciones incorrectas si la telemetría es muy ambigua.

## Enlaces

- HuggingFace: https://huggingface.co/Indium-AI-Labs/CrashDiag-Qwen2.5-3B-GRPO
- Repositorio del proyecto CrashDiag: https://github.com/Indium-AI-Labs/CrashDiag
- Perfil de Indium AI Labs en GitHub: https://github.com/Indium-AI-Labs/
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Informe técnico de Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v1

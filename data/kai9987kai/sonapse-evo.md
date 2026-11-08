# Kai9987kai/sonapse-evo

## Resumen

SONAPSE-EVO es una arquitectura neuronal recurrente experimental y auto-reestructurable publicada por el usuario independiente Kai9987kai (Kai piper) en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje preentrenado al uso, sino de un framework de investigación en PyTorch orientado a estudiar si un sistema neuronal artificial puede diagnosticar sus propias deficiencias funcionales, identificar dónde añadir cómputo neuronal adicional, construir circuitos dirigidos ("grafts") y preservar los cambios útiles bajo garantías transaccionales de seguridad.

El sistema se presenta como sucesor independiente de Sonapse-LAB e incluye un motor de diagnóstico causal de déficits, cuatro tipos de injertos neuronales (bridge de bajo rango, microcircuito recurrente, motivo biológico y adaptador donante), entrenamiento en sandbox aislado con el backbone congelado, y un protocolo de transacción atómica con verificación de digest SHA-256 y rollback automático. La arquitectura subyacente es un sustrato recurrente de tasas continuas, no un transformer, y no se publican parámetros totales, longitud de contexto ni datos de entrenamiento en el sentido habitual de un LLM.

La relevancia del proyecto es fundamentalmente investigadora: propone un protocolo de evaluación comparativa de 10 brazos (A0-A9) con controles emparejados para medir si el injerto causal supera a alternativas como fine-tuning, injertos aleatorios, adaptadores de capacidad equivalente, rewiring tipo RigL o transferencia desde donantes externos. No hay evidencia publicada de benchmarks estándar ni de uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente de tasas continuas con injertos modulares (grafts) y backbone congelado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio PyTorch, instalación editable vía `pip install -e .`) |

## Arquitectura y entrenamiento

El sustrato recurrente evoluciona según dinámicas de tasa continuas: `r_{t+1} = clip_[0,1][(1-η)r_t + η·φ((W_b^(ℓ) + W_p)r_t + B·o_t + Σ_g I_g(t) + b)]`, con `φ(x) = max(0, tanh(x))` y una cota de norma infinita sobre la suma de injertos de 0,10. El backbone (`W_b, W_p, B, b`) permanece estrictamente congelado durante el ajuste de los parámetros del injerto, que se entrena en un sandbox aislado. Los injertos se instalan con ganancia cero (`α_g(0) = 0`, `I_g(0) = 0`), garantizando invariancia matemática de la dinámica base en el momento del commit, seguida de rampas lineales de activación controladas.

Se definen cuatro tipos de injerto: Tipo A (bridge disperso de bajo rango con proyecciones factorizadas `U_g V_g`, que reduce parámetros de peso en un 50%: `k(|S|+|T|)` frente a `|S||T|`); Tipo B (microcircuito recurrente con estado de memoria interno `q_t` para tareas de retardo temporal); Tipo C (motivo biológico con subcircuitos con signo que obedecen la ley de Dale, `W_ij = s_j·a_ij` con `a_ij ≥ 0`); y Tipo D (adaptador donante con alineación de representaciones mediante regresión ridge regularizada para donantes externos como AETHER o Poseidon). El ciclo de vida incluye verificación de digest SHA-256 del padre, snapshots pre-commit y rollback automático ante fallo de validación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Diagnóstico causal de deficiencias neuronales mediante monitorización con 6 componentes exponencialmente ponderados: `d_t = [e_pred, e_policy, u_unc, c_rep, r_task, s_stab]`.
- Ranking de candidatos mediante gradiente sombra virtual y atribución causal.
- Construcción y entrenamiento aislado de injertos neuronales de cuatro tipos (A, B, C, D).
- Preservación exacta de función mediante rampa de ganancia cero e invariancia matemática en el commit.
- Gestión transaccional atómica con snapshots, digests SHA-256 y rollback automático.
- Evaluación comparativa con 10 brazos de control emparejados (A0-A9), incluyendo fine-tuning, injertos aleatorios, adaptadores de capacidad equivalente, RigL, motivos biológicos, transferencia de donantes y cotas oracle.
- Observatorio interactivo con servidor HTTP de telemetría científica en tiempo real y dashboard web en modo oscuro.
- CLI auditada con subcomandos `smoke`, `lesion-repair`, `benchmark` y `serve`.
- Suite de 17 tests unitarios y de integración (100% passing según la model card) que verifican inicialización zero-gain, inmutabilidad de lesiones, estimación de gradiente sombra, aislamiento del backbone congelado, integridad de digests de snapshot y rollback atómico.
- Soporte de tool calling, function calling, agentes multi-step, visión, audio y modo thinking: no disponible (no es un modelo de lenguaje generativo).

## Casos de uso

- Investigación en neurociencia computacional: el framework permite estudiar experimentalmente si un sistema artificial puede localizar regiones deficitarias y construir circuitos dirigidos, usando el protocolo de 10 brazos para comparar contra controles emparejados.
- Estudios de reparación tras lesión: el comando `lesion-repair --task forage --severity 0.20` permite cuantificar la recuperación dirigida mediante la métrica `R = (R_R - R_D)/(R_I - R_D)`, comparando retorno intacto, dañado y reparado.
- Investigación en aprendizaje continuo: el entrenamiento en sandbox aislado con backbone congelado y las garantías transaccionales permiten añadir capacidad sin degradar el comportamiento base, un escenario relevante para estudiar olvido catastrófico.
- Validación de protocolos de seguridad transaccional: el sistema de snapshots, digests SHA-256 y rollback automático sirve como banco de pruebas para mecanismos de commit atómico en sistemas de aprendizaje que se automodifican.
- Experimentos de transferencia entre modelos: el adaptador donante (Tipo D) con regresión ridge regularizada permite investigar alineación de representaciones entre sustratos externos como AETHER o Poseidon.
- Docencia y reproducibilidad: la suite de 17 tests y los ficheros de configuración (`smoke.yaml`, `lesion_repair.yaml`, `confirmatory_study.yaml`) permiten reproducir experimentos de forma controlada en entornos académicos.
- Telemetría científica en vivo: el observatorio HTTP en el puerto 8890 permite monitorizar en tiempo real la evolución de los injertos y las métricas de diagnóstico durante un experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe un protocolo de evaluación de 10 brazos (A0-A9) con controles emparejados y semillas configurables, pero no incluye cifras de rendimiento, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del sustrato recurrente no se especifica en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del sustrato; el proyecto está implementado en PyTorch y puede ejecutarse en CPU para los smoke tests, pero no se confirma en la documentación disponible.
- Opciones de despliegue: instalación local en modo editable (`pip install -e .`) y ejecución vía CLI (`python -m sonapse_evo.cli`); servidor HTTP de observatorio en el puerto 8890. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SONAPSE-EVO | RNN con injertos modulares (framework de investigación) | no disponible | no disponible | Apache 2.0 | Hugging Face (Kai9987kai/sonapse-evo) |
| Sonapse-LAB | Arquitectura predecesora del mismo autor | no disponible | no disponible | no disponible | Referenciada como predecesora; no se detalla su disponibilidad |
| AETHER | Donante externo mencionado en la model card | no disponible | no disponible | no disponible | no disponible |
| Poseidon | Donante externo mencionado en la model card | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Proyecto de investigación experimental: la propia model card lo etiqueta como "Research Architecture — Version 1.0", no como un modelo listo para producción.
- Ausencia de benchmarks publicados: no hay cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes, por lo que no es posible evaluar su rendimiento frente a alternativas.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, visión ni audio; su uso está restringido a experimentación con dinámicas recurrentes y injertos.
- Idiomas: solo se declara inglés (`en`), aunque al no ser un modelo generativo de texto esta etiqueta tiene un significado limitado.
- Trazabilidad del autor: el autor es un usuario individual sin publicaciones o papers asociados visibles en la información disponible; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica en el sentido de un LLM, pero el sistema de diagnóstico causal podría producir atribuciones espurias si los umbrales de monitorización no están bien calibrados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al tratarse de un framework de investigación sin validación en producción, su uso comercial no está respaldado por evidencia empírica.
- Dependencia de un entorno concreto: la guía de instalación hace referencia a una ruta local de Windows (`c:\Users\kai99\Desktop\New folder (13)`), lo que sugiere que el repositorio no está empaquetado para distribución estándar.
- Cota de injerto: la suma de contribuciones de injerto está limitada a norma infinita 0,10, lo que restringe la magnitud de las modificaciones que el sistema puede introducir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/sonapse-evo
- Perfil del autor en Hugging Face: https://huggingface.co/Kai9987kai
- Listado de modelos del autor: https://huggingface.co/Kai9987kai/models

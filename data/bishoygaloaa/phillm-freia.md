# bishoygaloaa/phillm-freia

## Resumen

FREIA es un modulo congelado de leyes newtonianas desarrollado por bishoygaloaa como componente del proyecto PhiLLM. No se trata de un modelo de lenguaje en sentido estricto: es un conjunto de tensores en formato `state_dict` de PyTorch que codifican de forma cerrada las actualizaciones de un simulador fisico newtoniano (integracion de Euler explicita, impulso elastico con coeficiente de restitucion e = 1 y reflexion de velocidad mediante transformaciones de Householder en colisiones con paredes). Los tensores no son pesos entrenados, sino constantes analiticas derivadas de las ecuaciones de la mecanica clasica.

El repositorio contiene dos ficheros de pesos en float64 (`freia_d1.pt` y `freia_d2.pt`) para escenarios en 1D y 2D, junto con un modulo autonomo `freia.py` que implementa la clase `FrozenNewton` con operaciones de carga, permutacion y rollout. La model card lo describe explicitamente como una cota superior de tipo oraculo: demuestra que las actualizaciones newtonianas pueden residir en un modulo congelado y coincidir con el simulador en las tareas que el modulo responde, pero no constituye un resultado de modelo de lenguaje.

Su relevancia es metodologica: sirve como referencia para evaluar hasta que punto un LLM (en este caso Qwen3.5-4B con LoRA) aprende o no las leyes fisicas frente a un modulo que las codifica exactamente. El autor subraya que Qwen3.5-4B LoRA se mantiene en 42% de exact match en distribucion (ID) y 0% fuera de distribucion (OOD), y que FREIA no sustituye ni modifica ese resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo congelado de leyes fisicas: tensores de forma cerrada (A = I, integrador de Euler explicito, impulso elastico, reflexion de Householder) |
| Parametros totales | No disponible (no es un modelo neuronal; son buffers `state_dict`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible (pesos en float64; el autor no documenta cuantizacion) |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `state_dict` de PyTorch en float64 (`.pt`) para 1D y 2D |

## Arquitectura y entrenamiento

FREIA no emplea una arquitectura de red neuronal ni ha sido entrenado. Los tensores codifican de forma analitica las actualizaciones de un simulador fisico: `A = I` de modo que la aceleracion es `a = F / m`; `E` implementa Euler explicito sobre la velocidad antigua (`x' = x + v Δt`, `v' = v + a Δt`); `C`, `Du` y `R` codifican el impulso elastico con coeficiente de restitucion e = 1; y `H` aplica una reflexion de Householder a la componente de velocidad en el eje de la pared golpeada. El modulo opera en float64 y se carga como un `state_dict` convencional de PyTorch.

La innovacion tecnica es la demostracion de que estas actualizaciones pueden vivir en un modulo congelado y reproducir exactamente el simulador en las tareas que el modulo responde. El autor valida que la puntuacion proviene de los tensores y no de otra fuente mediante un experimento de permutacion: al barajar `A`, `E`, `Dx`, `C`, `Du`, `R` y `H`, el exact match cae a 0% en ambas particiones, incluida la tarea T1 por si sola. La temporizacion de eventos (cuando ocurre un contacto) sigue dependiendo del generador de PhiLLM: contactos cuadraticos a velocidad constante, radio 0,05 y seleccion del evento mas temprano; las actualizaciones de velocidad, en cambio, pasan por los tensores.

## Capacidades

- Simulacion determinista de actualizaciones newtonianas en 1D y 2D mediante tensores congelados.
- Calculo de aceleracion a partir de fuerza y masa (`a = F / m`) con `A = I`.
- Integracion temporal con Euler explicito sobre la velocidad antigua.
- Resolucion de impulsos elasticos con coeficiente de restitucion e = 1.
- Reflexion de velocidad en colisiones con paredes mediante transformacion de Householder.
- Rollout de estados fisicos (`x`, `v`) a partir de un estado inicial y fuerzas dadas.
- Capacidad de permutar tensores para experimentos de ablacion (verificacion de que la puntuacion proviene de los tensores).
- No soporta tool calling, agentes, razonamiento en lenguaje natural, vision, audio ni capacidades multilingues.

## Casos de uso

- Referencia oraculo para evaluar modelos de lenguaje en fisica: se usa FREIA como cota superior exacta y se compara con el rendimiento de un LLM (por ejemplo, Qwen3.5-4B LoRA, que obtiene 42% ID / 0% OOD) para cuantificar la brecha entre aprendizaje y ley codificada.
- Ablacion controlada de tensores: al permutar los buffers y observar la caida a 0% de exact match, se valida que la metrica depende del contenido de los tensores y no de artefactos del evaluador.
- Generacion de datos sinteticos de fisica: el modulo puede producir transiciones de estado exactas para entrenar o validar modelos de world models en tareas newtonianas 1D y 2D.
- Verificacion de simuladores: sirve como implementacion de referencia en float64 para comprobar la correccion de integradores de Euler y rutinas de colision elastica.
- Test de robustez OOD: la particion `ood_mag` (100% con tensores intactos, 0% con tensores permutados) proporciona un banco de pruebas para medir generalizacion fuera de distribucion en modelos fisicos.
- Docencia y divulgacion: ejemplo minimalista de como empaquetar leyes fisicas analiticas como `state_dict` de PyTorch y cargarlas con `load_state_dict` en CPU.
- Integracion en pipelines de PhiLLM: el modulo se enlaza con el generador de eventos de PhiLLM (`phil/weightspace/freia.py`) para separar temporizacion de eventos y actualizaciones de estado.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre los primeros 50 ejemplos, con exact match y error absoluto medio (MAE):

| Condicion | Exact match | n | Descripcion |
|---|---:|---:|---|
| ID T1 | 100% (32/32) | 32 | escenas de siguiente estado que el modulo responde |
| ID mixed slice | 64% | 50 | mismo 32/32 en T1; T2 (n=11) y T3 (n=7) sin completar |
| ood_mag | 100% | 50 | todas T1; MAE de posicion y velocidad ~1e-16 |
| Tensores permutados, ID | 0% | 50 | T1 exact match tambien 0% (32/32 fallos) |
| Tensores permutados, ood_mag | 0% | 50 | T1 exact match 0% |
| Qwen3.5-4B LoRA | 42% ID / 0% OOD | 50 | el modelo de lenguaje; no sustituido por este repo |

MAE de posicion ID con el modulo intacto: ~3e-17 (cero numerico bajo el evaluador). MAE de posicion ID con tensores permutados: ~3,3.

## Requisitos de hardware

- VRAM estimada: insignificante; los tensores son de forma cerrada y caben en memoria de CPU (el repositorio ocupa 0,0 GB).
- GPU recomendadas: no se requiere GPU; el ejemplo de la model card carga los pesos con `map_location="cpu"`.
- Cabe en cualquier GPU consumer y en CPU; no hay requisitos de VRAM relevantes.
- Opciones de despliegue: PyTorch nativo (`torch.load` con `weights_only=True` y `load_state_dict`); no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no documentados; al ser operaciones tensoriales de forma cerrada en float64, la latencia depende del tamano del rollout y del hardware, no del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento fisico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FREIA (este repo) | Modulo congelado de leyes newtonianas | No aplica (buffers) | No aplica | 100% exact en T1 y ood_mag; 0% con tensores permutados | MIT | Hugging Face (`bishoygaloaa/phillm-freia`) |
| Qwen3.5-4B + LoRA | LLM con adaptador | 4B (aprox.) | No disponible | 42% ID / 0% OOD (n=50) | No disponible en la informacion | Referenciado en la model card |
| Simulador de PhiLLM | Generador de eventos fisicos | No aplica | No aplica | Proporciona temporizacion de eventos; actualizaciones via FREIA | No disponible en la informacion | Repositorio `bishoymoussa/Phil` |

No se dispone de comparativas con otros modulos de leyes fisicas congeladas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- Solo cubre mecanica newtoniana en 1D y 2D con Euler explicito, impulso elastico e = 1 y colisiones con paredes; no modela friccion, cuerpos rigidos complejos ni dinamica 3D.
- La temporizacion de eventos no reside en FREIA: depende del generador de PhiLLM (contactos cuadraticos a velocidad constante, radio 0,05, evento mas temprano).
- El autor lo describe como cota superior de tipo oraculo; no debe interpretarse como resultado de aprendizaje automatico ni como sustituto del LLM.
- Los resultados de Qwen3.5-4B LoRA (42% ID / 0% OOD) no se modifican por este repositorio; el autor lo indica explicitamente.
- El exact match del 64% en la particion ID mixed slice refleja que T2 (n=11) y T3 (n=7) quedan sin completar por el modulo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinacion no aplica (no genera texto); el riesgo relevante es de interpretacion: confundir esta cota oraculo con el rendimiento real de un LLM en fisica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bishoygaloaa/phillm-freia
- Dataset de resultados: https://huggingface.co/datasets/bishoygaloaa/phillm-results/tree/main/preds/freia
- Proyecto PhiLLM: https://bishoymoussa.github.io/Phil/
- Repositorio PhiLLM (modulo fuente `phil/weightspace/freia.py`): https://github.com/bishoymoussa/Phil

# Kai9987kai/SONAPSE-ORIGIN

## Resumen

SONAPSE-ORIGIN es un repositorio de Hugging Face publicado por el usuario Kai9987kai que, segun su model card, no contiene un modelo de lenguaje en el sentido convencional, sino una plataforma de investigacion en neurociencia computacional e inteligencia artificial. El autor la describe como una plataforma experimental "local-first" y "CPU-first" construida como continuacion independiente de Sonapse-LAB y del ecosistema de proyectos del mismo autor (Supermix, Poseidon, Aether, Tether, NEUROGRAFT, FAULTLINE, CROSSWIRE). La pregunta cientifica que declara abordar es si la exploracion automatizada de distintas organizaciones computacionales, dinamicas neuronales y mecanismos regulatorios puede revelar principios generalizables sobre la emergencia de cognicion integrada y propiedades relevantes para teorias de la consciencia.

El artefacto se presenta como un sistema dinamico heterogeneo y variable en el tiempo, formalizado como una tupla de estado (topologia, activaciones, pesos sinapticos, variables homeostaticas, afecto artificial, memoria episodica, cuerpo simulado y entorno) que evoluciona mediante operadores de intervencion causal y ruido controlado. Incluye modulos de generacion de hipotesis, registro de teorias (GWT, IIT-Proxy, RPT, HOT, PP, AST, TBT), criticos cientificos adversariales y un registro de evidencias con auditoria en SQLite.

Es relevante ahora unicamente como objeto de estudio metodologico: no es un modelo generativo desplegable, no publica pesos en formato safetensors o GGUF, no declara parametros ni ventana de contexto, y su model card no incluye resultados de benchmarks. Cualquier evaluacion de su utilidad practica debe partir de esa base: se trata de codigo de investigacion (Python 3.11+, orientado a Windows 11) y no de un artefacto de inferencia listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema dinamico heterogeneo con topologias de grafo/hipergrafo (16 familias), redes LIF, osciladores de Kuramoto, campos neuronales y modulos de teoria de la consciencia; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio se describe como plataforma Python; no se declaran pesos safetensors ni GGUF) |

## Arquitectura y entrenamiento

La plataforma modela cada organismo artificial como un sistema dinamico con estado \(\mathcal{S}_t = (G_t, X_t, W_t, H_t, A_t, M_t, B_t, E_t)\), donde \(G_t\) es la topologia estructural, \(X_t\) las activaciones, \(W_t\) los parametros sinapticos adaptativos, \(H_t\) un vector de nueve variables de viabilidad homeostatica (energia, integridad, temperatura, fatiga, reserva de recursos, incertidumbre, error de prediccion, cohesion social y estabilidad), \(A_t\) un vector de afecto artificial de diez dimensiones, \(M_t\) la memoria episodica y modelos metacognitivos, \(B_t\) el cuerpo simulado y \(E_t\) el entorno ecologico. La evolucion se resuelve con solvers numericos (Runge-Kutta de cuarto orden, Euler) y admite intervenciones causales del tipo \(do(X_i = c)\), lesiones quirurgicas y desplazamientos de parametros.

El modulo STRUCTURE FORGE incluye 16 familias de topologia (feedforward, recurrente, small-world, scale-free, modular jerarquica, rich-club, multicapa, hipergrafo dinamico, campo espacial, comunidades evolutivas, osciladores acoplados, hibrido neural-simbolico, global workspace, local workspace, regulatoria competitiva y recableado dinamico), junto con un motor de desarrollo neural con sinaptogenesis, STDP, poda y neurogenesis. El modulo DYNAMICAL SUBSTRATE LAB incorpora dinamica de spiking LIF, redes recurrentes de tasa continua, osciladores de Kuramoto con parametro de orden \(r\), campos neuronales continuos y comunicacion ondulatoria multidimensional.

No se especifica en la informacion disponible ningun proceso de entrenamiento supervisado, numero de tokens, composicion de dataset ni fases de RLHF o DPO. El autor declara 57 de 57 tests superados y una postura epistemica explicita con cinco distinciones (comportamiento observable, propiedades causales, analogias biologicas, predicciones de teorias de la consciencia e hipotesis especulativas), ademas de la regla de que ningun experimento de la plataforma afirma establecer sintiencia o consciencia fenomenica.

## Capacidades

- Simulacion de redes neuronales con dinamica de spiking (LIF), tasa continua, osciladores acoplados y campos neuronales.
- Generacion de topologias estructurales en 16 familias distintas, con hipergrafo de orden superior y paso de mensajes.
- Desarrollo neural simulado: sinaptogenesis, STDP, poda y neurogenesis.
- Modelado homeostatico con nueve variables de viabilidad y optimizacion de coste \(J_H = (h - h^*)^T Q (h - h^*)\).
- Neuromodulacion artificial (dopamina, serotonina, noradrenalina, acetilcolina) y dinamica afectiva de diez dimensiones con matriz de interaccion estable de Lyapunov.
- Mecanismos de fatiga, recuperacion en reposo, sueno, replay offline (saliente, aleatorio o sin replay) y renormali zacion sinaptica.
- Evaluacion de proxies de teorias de la consciencia: global workspace con saltos de ignition, integracion causal con sensibilidad a particiones y proxy de PCI, procesamiento recurrente con lesiones de feedback, predictive processing con minimizacion de energia libre jerarquica, representacion de orden superior con ROC AUC tipo 2 y ECE, attention schema y temporal binding con phase-locking values.
- Entornos simulados por niveles (se cita un "Level 1: Minimal Regulatory Worl..." truncado en la model card).
- Director de investigacion con generacion de hipotesis preregistradas, criterios de falsacion, criticos adversariales y registro de evidencias con recibos criptograficos y auditoria SQLite.
- No se declara soporte de tool calling, function calling, agentes LLM, vision, audio ni generacion de lenguaje natural.

## Casos de uso

- Investigacion en neurociencia computacional: reproducir experimentos de dinamica de redes (LIF, Kuramoto, campos neuronales) sobre las 16 familias de topologia para estudiar que organizaciones estructurales producen sincronizacion o integracion medible.
- Estudio metodologico de teorias de la consciencia: usar los modulos de evaluacion (GWT, IIT-Proxy, RPT, HOT, PP, AST, TBT) para generar predicciones falsables y contrastarlas en sistemas artificiales bajo condiciones controladas.
- Experimentos de lesion y ablacion: aplicar intervenciones \(do(X_i = c)\) y lesiones quirurgicas para medir sensibilidad causal a particiones y proxies de PCI en redes simuladas.
- Modelado de homeostasis y afecto artificial: simular agentes con variables de viabilidad y neuromoduladores para estudiar trayectorias de recuperacion, fatiga y replay offline en entornos regulatorios minimos.
- Docencia y formacion: plataforma CPU-first en Python 3.11+ que permite a estudiantes ejecutar simulaciones de sistemas dinamicos complejos sin GPU dedicada.
- Auditoria de practicas de investigacion: el registro de evidencias con recibos criptograficos y la separacion explicita entre comportamiento observable y afirmaciones sobre experiencia subjetiva sirven como plantilla de rigor metodologico.
- Prototipado de arquitecturas hibridas neural-simbolicas: el modulo STRUCTURE FORGE incluye una familia hibrida que puede emplearse para explorar acoplamientos entre componentes simbolicos y subsimbolicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La plataforma se declara "CPU-first" y "local-first", orientada a Windows 11 con Python 3.11 o superior; no requiere GPU por diseno.
- VRAM estimada para inferencia: no aplica, al no tratarse de un modelo de pesos con inferencia neuronal estandar; no disponible.
- GPU recomendadas: no disponibles; el diseno prioriza CPU.
- Cabe en GPU consumer: no aplica segun la informacion disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el despliegue es la ejecucion directa del codigo Python de la plataforma.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SONAPSE-ORIGIN (Kai9987kai) | Plataforma de investigacion en neurociencia computacional (Python) | no disponible | no disponible | Apache-2.0 | Hugging Face y GitHub |
| SONAPSE-EVO (Kai9987kai) | Arquitectura recurrente auto-reestructurante experimental | no disponible | no disponible | no disponible | Hugging Face |
| Sonapse-LAB (kai9987kai) | Predecesor experimental del ecosistema Sonapse | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos de benchmarks ni de especificaciones cuantitativas de SONAPSE-EVO o Sonapse-LAB en la informacion proporcionada, por lo que la comparacion se limita a tipo de artefacto, licencia y disponibilidad. No se identifican modelos de lenguaje comparables de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes LLM, y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- No se publican pesos en safetensors ni GGUF; el repositorio es codigo de investigacion, no un artefacto de inferencia desplegable.
- Ausencia total de datos de entrenamiento, parametros, contexto y cuantizacion: imposible estimar coste, latencia o calidad de forma cuantitativa.
- El propio autor declara que ningun experimento establece sintiencia o consciencia fenomenica; cualquier lectura de los resultados como evidencia de consciencia artificial seria una interpretacion indebida.
- Los tags incluyen "consciousness-theories" y "active-inference", terminos con alta carga especulativa; conviene tratarlos como etiquetas de area de investigacion, no como propiedades demostradas del sistema.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa por parte de la comunidad.
- La model card esta truncada en la informacion disponible (seccion ENVIRONMENT FORGE), por lo que pueden faltar modulos y caveats relevantes.
- Licencia Apache-2.0 permite uso comercial del codigo, pero no existe ninguna garantia de correccion cientifica ni de idoneidad para produccion.
- Dependencia declarada de Windows 11 y Python 3.11+, lo que puede limitar la portabilidad a otros entornos sin adaptacion.

## Enlaces

- Hugging Face: https://huggingface.co/Kai9987kai/SONAPSE-ORIGIN
- GitHub: https://github.com/kai9987kai/SONAPSE-ORIGIN
- Sonapse-LAB (predecesor): https://github.com/kai9987kai/Sonapse-LAB
- Perfil del autor en Hugging Face: https://huggingface.co/Kai9987kai
- SONAPSE-EVO (proyecto relacionado): https://huggingface.co/Kai9987kai/sonapse-evo
- Python 3.11+: https://www.python.org/downloads/

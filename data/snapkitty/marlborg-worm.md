# Snapkitty/marlborg-worm

## Resumen

Marlborg-WORM es un sistema de agente autónomo auto-modificable desarrollado por Snapkitty, que explora la posibilidad de que un agente pueda reescribir sus propias reglas mientras una capa de monitorización hardware observa en tiempo real el esfuerzo computacional (cognitive strain) de ese proceso. No se trata de un modelo de lenguaje convencional, sino de una implementación full-stack que abarca desde descripciones de circuitos cuánticos hasta restricciones de tapeout en ASIC de 7 nm.

El sistema integra una máquina virtual escrita en Common Lisp y Janet, con capas de verificación formal (Lean 4, SVA), resistencia a side-channel (WDDL, jitter engine), y una cadena WORM (Write Once Read Many) que registra de forma inmutable todas las operaciones. Su objetivo central es responder si un sistema auto-modificable puede observar y limitar su propia transformación sin necesidad de una autoridad externa. El proyecto es relevante en el ámbito de la seguridad de agentes autónomos y la robustez de sistemas críticos, aunque se encuentra en una fase de investigación y no ofrece un modelo desplegable para tareas de procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de agente auto-modificable (no es un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos de red neuronal) |

## Arquitectura y entrenamiento

Marlborg-WORM no es un modelo entrenado con datos masivos, sino un sistema diseñado por capas. La arquitectura se compone de varios niveles: una capa cuántica (descrita en Q#, Circom y Lean 4) que define qué computa el sistema; una capa de especificación hardware en Clash/Haskell; una capa RTL sintetizable en SystemVerilog/Verilog/BSV; verificación formal con SVA y SymbiYosys; resistencia a side-channel con WDDL y un jitter engine; implementación física en 7 nm (SDC, UPF, DRC); runtime en Rust y C; y la máquina virtual en Common Lisp y Janet. El sistema incorpora un modelo de entropía cognitiva que calcula el esfuerzo computacional en nats y aplica umbrales de seguridad (safe limit 0.20, warning 0.30, lockout 0.40). No hay un proceso de entrenamiento en el sentido clásico; el sistema se construye mediante reglas que pueden modificarse a sí mismas, pero cada modificación es observada y medida por el monitor de strain hardware.

## Capacidades

- Auto-modificación de reglas: el sistema permite que las reglas modifiquen otras reglas, siempre que el coste computacional (strain) se mantenga dentro del sobre permitido.
- Monitorización de strain en tiempo real: una capa hardware always-on calcula la entropía cognitiva y puede rechazar o bloquear modificaciones que excedan los umbrales.
- Cadena WORM inmutable: cada operación (instalación de reglas, transiciones de estado, intentos de acceso) se registra de forma permanente con hash SHA3-256, sin posibilidad de borrado o reescritura.
- Verificación formal: propiedades matemáticas como convergencia, cumplimiento en tiempo real, ausencia de metastabilidad e integridad de la cadena están demostradas con Lean 4 y aserciones SVA.
- Resistencia a ataques de side-channel: mediante lógica WDDL y un jitter engine, el sistema protege contra análisis de potencia y ataques de temporización.
- Tolerancia a radiación: con triple redundancia modular (TMR) y pseudo-ELT, soporta dosis totales de ionización superiores a 300 krad.
- Soporte de prueba de conocimiento cero: integra Circom ZK-SNARKs para la autenticación sin fuga de información.

## Casos de uso

- Investigación en seguridad de agentes autónomos: el sistema permite estudiar cómo un agente puede auto-modificarse de forma controlada, lo que es relevante para el diseño de futuros agentes de IA con capacidades de auto-mejora seguras.
- Desarrollo de hardware de seguridad: la implementación en ASIC de 7 nm con monitor de strain siempre activo puede servir como referencia para chips de seguridad en entornos críticos (militar, aeroespacial, infraestructuras).
- Verificación formal de sistemas auto-modificables: las pruebas matemáticas incorporadas (convergencia, integridad de cadena) son un caso de estudio para la aplicación de Lean 4 en sistemas complejos.
- Auditoría de integridad de registros: la cadena WORM puede utilizarse como modelo para sistemas de logging inmutable en aplicaciones financieras o legales.
- Entrenamiento en ciberseguridad: el principio de "el esfuerzo del atacante se convierte en su derrota" puede ilustrar estrategias de defensa activa en cursos avanzados.
- Exploración de arquitecturas híbridas cuántico-clásicas: la descripción cuántica y su integración con hardware clásico ofrece un banco de pruebas para futuros sistemas híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El sistema no presenta métricas de rendimiento en tareas típicas de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. Los datos técnicos del hardware (frecuencia 100 MHz, área 0.16 mm², potencia activa 14.2 mW) se refieren al ASIC de monitorización, no a un rendimiento de inferencia.

## Requisitos de hardware

- El sistema está diseñado para un ASIC específico en TSMC N7FFC (7 nm FinFET), no para GPUs convencionales.
- No se proporcionan requisitos de VRAM ni de GPU porque no es un modelo de red neuronal.
- El despliegue en hardware comercial no es posible directamente; se requiere el tapeout del ASIC descrito.
- Para ejecutar la máquina virtual en software (sin el hardware), se necesitaría un entorno con SBCL (Common Lisp) y Janet, pero no se especifican requisitos mínimos.
- Las opciones de despliegue estándar (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este sistema.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable en el ámbito de los modelos de lenguaje, ya que Marlborg-WORM no es un modelo de lenguaje ni un sistema de IA generativa. Dentro del ámbito de agentes auto-modificables, no hay sistemas públicos con características similares documentadas.

## Limitaciones y advertencias

- El sistema es un prototipo de investigación; no hay documentación de uso práctico ni soporte.
- La licencia no está especificada, por lo que no se puede determinar si es permitido su uso comercial o de cualquier tipo.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que no contiene código fuente ni documentación accesible públicamente (solo la model card).
- No hay evidencia de que el sistema haya sido probado fuera de un entorno simulado; las afirmaciones sobre hardware (7 nm, 300 krad) son teóricas y no verificadas.
- Riesgo de alucinación: al no ser un modelo de lenguaje, este concepto no aplica; sin embargo, las afirmaciones del autor sobre propiedades formales no han sido revisadas por terceros.
- Limitaciones de contexto e idioma: no aplica, pero el sistema no está diseñado para procesamiento de lenguaje natural.
- Para producción, el sistema no está listo; es un experimento académico sin garantías de estabilidad ni seguridad.

## Enlaces

- [HuggingFace - Snapkitty/marlborg-worm](https://huggingface.co/Snapkitty/marlborg-worm)
- [Model card original (README)](https://huggingface.co/Snapkitty/marlborg-worm/resolve/main/README.md) (en el repositorio no se encuentran otros enlaces externos en la información proporcionada).

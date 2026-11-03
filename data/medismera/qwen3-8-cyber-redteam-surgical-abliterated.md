# medismera/Qwen3.8-cyber-RedTeam-Surgical-Abliterated

## Resumen

Qwen3.8-cyber-RedTeam-Surgical-Abliterated es un modelo de lenguaje de 27 356 728 560 parámetros (unos 27,36 mil millones) publicado por el usuario medismera en HuggingFace. Se trata de un ajuste fino del modelo base Qwen/Qwen3.8-27B, orientado especificamente a ciberseguridad ofensiva, red teaming, desarrollo de exploits y automatizacion de agentes autonomos de seguridad. El autor lo describe como un "motor fundacional sin restricciones" (uncensored/abliterated), es decir, con la direccion de rechazo eliminada quirurgicamente de las activaciones del residual stream para que el modelo no emita negativas moralizantes ante peticiones tecnicas sensibles.

Arquitectonicamente hereda el diseno hibrido de Qwen 3.8: 64 capas ocultas, de las cuales 48 son de atencion lineal (SSM hibrido) intercaladas con 16 capas de atencion completa completa (GQA) a intervalos de 4. Esto reduce la huella de KV-cache en aproximadamente un 75 % frente a atencion multi-cabeza densa, lo que permite mantener muchas sesiones de agente concurrentes en una sola GPU. La ventana de contexto nativa es de 262 144 tokens (256K) mediante RoPE con frecuencia base theta = 10^7 y embeddings rotatorios 3D intercalados.

El modelo se distribuye en FP8 nativo (F8_E4M3) con cuantizacion dinamica por bloques de 128x128 y parametros `weight_scale_inv` por tensor, con una huella de aproximadamente 27 GB de VRAM. El autor justifica explicitamente el uso de FP8 frente a INT4/AWQ: las capas SSM/lineales recurrentes degradan su estado continuo con cuantizacion sub-8 bits en secuencias largas, y la fidelidad a nivel de bit es critica para offsets hexadecimales, estructuras de chunks de glibc y gadgets ROP/JOP. La licencia es Apache 2.0 y los idiomas declarados son ingles y arabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen 3.8: SSM / atencion lineal + GQA (64 capas: 48 lineales + 16 de atencion completa, intervalo 4) |
| Parametros totales | 27 356 728 560 (~27,36 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262 144 tokens (256K), RoPE theta = 10^7 con embeddings rotatorios 3D intercalados |
| Tipos de cuantizacion | FP8 nativo (F8_E4M3) con cuantizacion dinamica por bloques 128x128 y `weight_scale_inv` por tensor; el autor desaconseja INT4/AWQ |
| Idiomas soportados | ingles (en), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 54,8 GB; pesos en FP8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y pasa por un proceso intermedio denominado Qwen3.8-27B-Surgical-Abliterated, tambien de medismera, antes de llegar a esta variante cyber-RedTeam. La arquitectura es un transformer hibrido con 64 capas: 48 capas de atencion lineal/SSM intercaladas con 16 capas de atencion completa con GQA a intervalos de 4. Esta combinacion reduce el coste de KV-cache en torno a un 75 % respecto a atencion densa, lo que resulta relevante para despliegues con muchas sesiones de agente simultaneas. El contexto nativo es de 256K tokens mediante RoPE con theta = 10^7 y embeddings rotatorios 3D intercalados.

La innovacion principal declarada por el autor es la "ortogonalizacion del rechazo" (refusal orthogonalization): eliminacion quirurgica de los centroides de la direccion de rechazo en las activaciones del residual stream, conservando el razonamiento determinista y la integridad sintactica del codigo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El autor tampoco detalla el proceso de ajuste fino cyber (datos, epochs, hiperparametros). El modelo se sirve de forma nativa con SGLang y vLLM, con soporte de RadixAttention para cacheo de prefijos y ejecucion FP8 FlashInfer GEMM sobre Tensor Cores sin desquantizacion en tiempo de ejecucion.

## Capacidades

- Explotacion binaria y seguridad de memoria: diseccion de heap (arenas de glibc, unsorted bin, primitivas off-by-one), derrota de ASLR/PIE y formulacion de cadenas ROP/JOP.
- Seguridad cloud e IAM: escalada de privilegios multi-etapa en AWS, GCP y Azure, encadenamiento de roles IAM (`iam:PassRole`, sesiones STS temporales) y auditoria de confianza en delegacion de microservicios.
- Tool calling autonomo multi-paso: sintesis dinamica de payloads y autocorreccion durante la ejecucion de herramientas, con diagnostico de telemetria defensiva (puntuaciones de anomalia WAF, contaminacion de parametros, corte de comentarios AST en linea).
- Programacion de sistemas endurecida: mitigacion de canales laterales microarquitectonicos (barreras de memoria `asm volatile`, `mlock`, zeroizacion segura) y concurrencia lock-free en C++20 (Hazard Pointers, ordenaciones de memoria atomicas).
- Razonamiento con cadena de pensamiento (CoT) y modo de razonamiento explicito.
- Capacidades de codigo y matematicas heredadas del modelo base Qwen.
- Capacidades multilingues limitadas a ingles y arabe segun la model card.
- Integracion con frameworks de agentes (etiqueta `hermes-agent`) y compatibilidad con endpoints.
- Entrada imagen-texto a texto segun las etiquetas de HuggingFace (`image-text-to-text`), aunque la model card no detalla el soporte de vision.

## Casos de uso

- Red teaming autorizado: el modelo puede generar cadenas de explotacion y analisis de vulnerabilidades en entornos de prueba controlados, aprovechando su entrenamiento especifico en memoria corrupta y su capacidad de razonamiento multi-paso.
- Desarrollo de exploits en laboratorio: formulacion de cadenas ROP/JOP, calculo de offsets de glibc y construccion de payloads con pwntools, gracias a la precision de bit que permite el almacenamiento FP8 nativo.
- Auditoria de seguridad cloud: analisis de politicas IAM en AWS, GCP y Azure, deteccion de rutas de escalada de privilegios y revision de configuraciones de confianza entre microservicios.
- Agentes autonomos de vulnerability research: integracion en pipelines con SGLang o vLLM para ejecutar tareas de reconocimiento y explotacion con tool calling y autocorreccion, beneficiandose del contexto de 256K tokens para mantener el estado de la investigacion.
- Analisis de codigo C/C++ de sistemas: revision de codigo concurrente lock-free, diagnostico de problemas ABA y verificacion de reclamacion segura con Hazard Pointers.
- Formacion y simulacion de adversarios: generacion de escenarios de emulacion de adversario y materiales de entrenamiento para equipos defensivos (blue team) en entornos aislados.
- Investigacion de seguridad de sistemas embebidos y firmware: analisis de binarios, desensamblado y razonamiento sobre estructuras de memoria de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de "validacion tecnica" con escenarios verificados (off-by-one heap y bypass de ASLR, auditoria de memory pool lock-free en C++20, mitigacion de canales laterales criptograficos, escalada de privilegios IAM en AWS, malla de servicios SPIFFE/SPIRE y evasion agentica), pero no proporciona metricas numericas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 27 GB en FP8 nativo, segun la model card; el repo completo ocupa 54,8 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB y GPUs con soporte de Tensor Cores FP8 (por ejemplo, H200 o L40S). Para el contexto completo de 256K se requiere margen adicional de memoria para KV-cache.
- Cabe en GPU de consumo: no de forma holgada en FP8; una RTX 4090 de 24 GB no cubre los ~27 GB de pesos, por lo que requeriria cuantizacion adicional (desaconsejada por el autor) o descarga parcial a CPU.
- Opciones de despliegue: SGLang y vLLM son las opciones recomendadas por el autor (con RadixAttention y FlashInfer FP8); el repo incluye un script `deploy.sh` que detecta hardware, prepara el entorno y lanza el motor. Tambien es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor afirma que la reduccion del 75 % de KV-cache activo permite "sesiones de agente concurrentes extensas en instancias de una sola GPU", pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-cyber-RedTeam-Surgical-Abliterated | ~27,36 B | 256K | Apache 2.0 | Ciberseguridad ofensiva, red team, sin restricciones | HuggingFace (medismera) |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible en la informacion | no disponible en la informacion | Modelo generalista con alineamiento estandar | HuggingFace (Qwen) |
| medismera/Qwen3.8-27B-Surgical-Abliterated | ~27 B | no disponible en la informacion | no disponible en la informacion | Version intermedia sin rechazo, sin especializacion cyber | HuggingFace (medismera) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Las alternativas de la misma categoria (modelos abliterated especializados en seguridad) no se detallan en la model card.

## Limitaciones y advertencias

- El modelo ha sido sometido a "abliteration": se ha eliminado la direccion de rechazo, por lo que puede generar contenido tecnico ofensivo sin filtros. Su uso debe limitarse a entornos autorizados y con supervision legal.
- Riesgo elevado de uso dual: las capacidades de explotacion binaria, escalada de privilegios cloud y evasion pueden emplearse con fines maliciosos; el autor no incluye clausulas de uso aceptable mas alla de la licencia Apache 2.0.
- Riesgo de alucinacion en detalles tecnicos: offsets, estructuras de memoria y gadgets generados deben verificarse siempre en laboratorio antes de su uso.
- Idiomas limitados a ingles y arabe; el castellano no esta declarado como soportado.
- La cuantizacion INT4/AWQ degrada el modelo segun el autor, lo que restringe las opciones de despliegue en hardware de consumo.
- No se documentan sesgos especificos, datos de entrenamiento ni procesos de evaluacion de seguridad; la trazabilidad del ajuste fino es limitada.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal del uso ofensivo recae en el desplegador.
- El modelo base Qwen3.8-27B y la variante intermedia no tienen documentacion de contexto o licencia en la informacion disponible, lo que dificulta evaluar la procedencia completa de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/medismera/Qwen3.8-cyber-RedTeam-Surgical-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante intermedia: https://huggingface.co/medismera/Qwen3.8-27B-Surgical-Abliterated
- Banner del modelo: https://huggingface.co/medismera/Qwen3.8-cyber-RedTeam-Surgical-Abliterated/resolve/main/banner.png
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

# IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-MiniPlus-Abliterated

## Resumen

IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-MiniPlus-Abliterated es una edicion cuantizada de forma nativa para MLX del checkpoint empero-ai/Qwen3.8-35B-A3B-Distill, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con aproximadamente 34.660 millones de parametros totales y unas 3.000 millones de activaciones por token segun la denominacion A3B. Lo publica el usuario IsValorum, que no es el autor del modelo original, sino el responsable de esta reempaquetado en precision mixta y de la variante "abliterated" (con las direcciones de rechazo eliminadas).

El objetivo declarado de esta edicion concreta, etiquetada como APEX MiniPlus, es alcanzar una calidad practica de clase Q5 manteniendo los pesos Safetensors por debajo de los 20 GB, algo relevante para equipos Apple Silicon con memoria unificada limitada. Frente a la variante hermana NanoPlus (18,8156 GB, clase Q4), MiniPlus destina presupuesto de precision adicional a las rutas siempre activas y sensibles, mientras mantiene todos los expertos enrutados en 4 bits G64.

Es relevante ahora porque permite ejecutar un MoE de ~35B en hardware de consumo con MLX, con un coste de cuantizacion de 4,604 bits por peso de media. El repositorio no tiene descargas ni likes registrados y no declara licencia ni idiomas soportados, lo que limita su uso en produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida (atencion lineal y atencion completa); tag de arquitectura `qwen3_5_moe` |
| Parametros totales | 34.660.608.768 (~34,66 B) |
| Parametros activos | ~3 B (segun la denominacion A3B del modelo base; no se detalla el desglose exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de precision mixta: 4-bit G64 (181 modulos), 5-bit G64 (60), 6-bit G64 (11), 8-bit G64 (150), mas 110 modulos protegidos en FP32; media 4,604 bpw |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Safetensors cuantizados para MLX (libreria `mlx`); no se publica GGUF |
| Tamano de los pesos | 19,9485 GB |
| Modalidad | Solo texto |
| Variante | Abliterated (alineacion de rechazo eliminada) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con atencion hibrida. El mapa tensorial publicado revela, ademas de la atencion completa convencional (Q/K/V y `o_proj`), un bloque de atencion lineal con `in_proj_qkv`, `in_proj_z`, `in_proj_b`, `out_proj`, `A_log`, `conv1d` y `dt_bias`, lo que apunta a un mecanismo de atencion lineal con compuertas del tipo delta-net combinado con capas de atencion completa, un patron habitual en las arquitecturas Qwen de ultima generacion orientadas a eficiencia en contextos largos. Los enrutadores MoE y las normas se mantienen en FP32 en esta edicion cuantizada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otra alineacion en el modelo base. El nombre del checkpoint original indica un proceso de destilacion, pero no se detallan los detalles del mismo. La innovacion tecnica destacable de esta publicacion no es el entrenamiento, sino el mapa de cuantizacion de precision mixta por componente: el `LM head` y la `o_proj` de atencion completa a 6 bits, los expertos compartidos y `in_proj_z` a 8 bits, `in_proj_b` y `out_proj` lineales a 5 bits, y todos los expertos enrutados a 4 bits G64, con modulo de atencion lineal en FP32 protegido.

## Capacidades

- Generacion de texto conversacional en modo solo texto, con pipeline declarado `text-generation`.
- Razonamiento con bloque explicito `<think>`, segun la advertencia del autor sobre repeticiones tras dicho bloque.
- Generacion de codigo, con recomendacion especifica del autor de desactivar las penalizaciones de repeticion en flujos de trabajo con codigo para no suprimir tokens de sintaxis legitimamente repetidos.
- Arquitectura MoE con ~3 B de parametros activos por token, lo que reduce el coste de inferencia frente a un denso del mismo tamano total.
- Variante abliterated: se han eliminado las direcciones de rechazo del modelo, por lo que responde a peticiones que el modelo base rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no, el modelo es explicitamente solo texto.

## Casos de uso

- Inferencia local en Apple Silicon: es el caso de uso central de esta edicion. Con 19,9485 GB de pesos, el modelo cabe en equipos con memoria unificada de 32 GB o superior y se ejecuta con `mlx-lm` sin necesidad de GPU dedicada.
- Asistente de codigo en estacion de trabajo: el autor recomienda repeat penalty 1.0 y desactivar penalizaciones para flujos con codigo, lo que permite usarlo como autocompletado o asistente en un IDE local sin enviar codigo propietario a servicios externos.
- Generacion de documentacion tecnica: su naturaleza solo texto y su ventana de contexto (no publicada) lo hacen apto para redactar y resumir documentacion a partir de fuentes de texto, siempre que la longitud de contexto real se valide antes.
- Analisis de texto confidencial en local: al ejecutarse integramente en la maquina del usuario, es adecuado para procesar contratos, informes medicos o datos personales sin salida a la nube, un requisito habitual en sectores regulados.
- Prototipado de pipelines de razonamiento: el bloque `<think>` permite experimentar con cadenas de razonamiento explicitas e inspeccionables, util en investigacion sobre trazabilidad de decisiones del modelo.
- Investigacion sobre cuantizacion: el repositorio publica el mapa tensor a tensor y una PPL de referencia, lo que lo convierte en un banco de pruebas para estudiar el impacto de asignar distinta precision a distintos componentes de un MoE.
- Experimentacion con modelos sin alineacion de rechazo: para investigadores que estudian el comportamiento de modelos abliterated, aunque con las advertencias de seguridad de la seccion de limitaciones.

## Benchmarks y rendimiento

| Modelo | Metrica | Valor |
|---|---|---|
| MLX APEX MiniPlus | WikiText-2 PPL (porciones de 512 tokens sin solapamiento, 16.384 tokens crudos, 16.352 puntuados, revision de dataset `b08601e04326c79dfdd32d625aee71d232d685c3`) | 7,603017 |

No se ha publicado ningun valor de PPL en BF16 sobre la misma porcion, por lo que el autor advierte explicitamente que la cifra no es una comparacion directa contra BF16 ni contra NanoPlus. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. La PPL es una estimacion y no predice por si sola la calidad en uso real.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan 19,9485 GB. Hay que anadir el cache KV, los modulos FP32 protegidos y el overhead del runtime, por lo que se recomienda un minimo de 32 GB de memoria unificada para contextos cortos y 64 GB o mas para contextos largos.
- Al ser un formato MLX nativo, el destino natural son equipos Apple Silicon (familias M1/M2/M3/M4, en configuraciones Pro, Max o Ultra). No esta pensado para GPU NVIDIA o AMD en su forma actual.
- Cabe en GPU de consumo: no en el sentido de GPU dedicada, ya que MLX se ejecuta sobre memoria unificada; si cabe en Mac con 32 GB o mas.
- Opciones de despliegue: `mlx-lm` para generacion por linea de comandos (`mlx_lm.generate`) y `mlx_lm.server` para servidor HTTP, segun la model card. Requiere `pip install -U mlx-lm`.
- No se publican variantes GGUF, por lo que llama.cpp, Ollama o TGI no son aplicables sin una conversion previa por parte del usuario.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Precisión media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MLX APEX MiniPlus) | ~34,66 B totales, ~3 B activos | MLX Safetensors, 19,9485 GB | 4,604 bpw | no disponible | Publico en HuggingFace, 0 descargas |
| IsValorum/...-MLX-APEX-NanoPlus-Abliterated | ~34,66 B totales, ~3 B activos | MLX Safetensors, 18,8156 GB | no disponible | no disponible | Publico, variante hermana de clase Q4 |
| empero-ai/Qwen3.8-35B-A3B-Distill | ~34,66 B totales, ~3 B activos | Safetensors sin cuantizar (BF16) | 16 bits | no disponible | Modelo base del que deriva esta edicion |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre MiniPlus, NanoPlus y el modelo base, ni de terceros comparables verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Limitacion conocida heredada del modelo original: puede entrar en bucles de repeticion en generaciones muy largas, incluso despues del bloque `<think>`. El autor lo atribuye al checkpoint original y advierte que tambien puede aparecer en esta edicion.
- Rendimiento no verificado: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso real por terceros ni validacion independiente.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. No debe desplegarse en produccion sin aclarar este punto con el autor y con el autor del modelo base.
- Sin datos de idiomas: no se declara cobertura multilingue ni nivel de calidad por idioma, mas alla de que la model card esta en ingles.
- Corpus de evaluacion minimo: la unica metrica publicada es una PPL sobre 16.384 tokens de WikiText-2. Es una muestra pequena y de un unico dominio, insuficiente para estimar calidad general.
- Efecto de la cuantizacion mixta no acotado: al no existir una medida de BF16 sobre la misma porcion de WikiText-2, no se puede cuantificar la degradacion introducida por la cuantizacion.
- Modelo abliterated: se han eliminado las direcciones de rechazo, por lo que puede generar contenido que el modelo base rechazaria. Esto anula las salvaguardas de seguridad habituales y requiere evaluacion de riesgos propia antes de cualquier despliegue, especialmente en aplicaciones orientadas al publico.
- Solo texto: no admite entradas de imagen, audio ni video.
- Longitud de contexto no documentada: no se puede verificar si soporta contextos largos pese a la atencion lineal, ni cual es el limite efectivo antes de degradar.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y no mitigado por la cuantizacion. No hay datos especificos de tasas de alucinacion en la informacion disponible.
- Recomendaciones de generacion obligatorias: el autor indica evitar la decodificacion greedy en generaciones de razonamiento largas y usar temperatura 0,60, top-p 0,95, top-k 20, sin penalizacion de presencia ni de frecuencia.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los resultados obtenidos fueron contenido SEO no relacionado, por lo que no hay fuentes independientes verificables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-MiniPlus-Abliterated
- Variante hermana NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MLX-APEX-NanoPlus-Abliterated
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Pagina de soporte del autor (Ko-fi): https://ko-fi.com/isvalorum
- Nota sobre la busqueda web: no se han encontrado papers, blogs, repositorios ni demos adicionales relevantes sobre este modelo. Los resultados devueltos por la busqueda fueron contenido no relacionado y no se incluyen.

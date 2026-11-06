# DeepNarra/Hiraya-1-H-MoE

## Resumen

DeepNarra Hiraya-1-H-MoE 1.0 es un modelo de generacion de texto de arquitectura Mixture-of-Experts (MoE) jerarquica desarrollado por DeepNarra, una organizacion que publica arquitecturas experimentales de bajo coste computacional. El modelo parte de Hiraya-1-Base (118M parametros) y lo "upcyclea" a una arquitectura H-MoE con 92 sub-expertos por capa, alcanzando 908.645.372 parametros totales con aproximadamente 100M parametros activos por token. Se presenta como la fase 2 de un linaje de cuatro etapas (Base, H-MoE, Instruct, Reasoning).

El interes tecnico reside en su topologia de expertos anidada: 23 macro-motores y 4 micro-expertos por cada uno, mas un experto fundacional compartido activo en el 100% de los tokens. El backbone es de tipo Zamba2 (hibrido con atencion y componentes recurrentes), con d_model de 768, 8 capas y un vocabulario de 48.760 tokens. Con solo 100M parametros activos, el modelo apunta a despliegue en entornos de borde y a investigacion en decodificacion especulativa y memoria recurrente sub-cuadratica.

Es relevante ahora por su licencia Apache-2.0, su enfoque en eficiencia computacional extrema y su enfasis declarado en una "politica de cero puntuaciones falsas", es decir, no publicar benchmarks no verificables. No obstante, el modelo es muy reciente, con adopcion practicamente nula (202 descargas, 0 likes) y sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-MoE-Zamba2-92-Expert-Nested-Hierarchical (hibrida tipo Zamba2 con MoE jerarquica) |
| Parametros totales | 908.645.372 (0,91B) en 1.331 tensores |
| Parametros activos | ~100M por token (macro_k = 2, micro_k = 2, es decir, 4 sub-expertos activos + experto fundacional compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona GGUF BitNet b1.58 como caso de uso previsto, sin detallar artefactos) |
| Idiomas soportados | ingles y multilingue (sin lista cerrada de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 3,46 GB); se mencionan GGUF en la seccion de licencia |
| Dimensiones del backbone | d_model = 768, num_layers = 8, vocab_size = 48.760 |
| Topologia de expertos | 23 macro-motores x 4 micro-expertos = 92 sub-expertos por capa; 736 sub-expertos totales en 8 capas |
| Balanceo de carga MoE | Sinkhorn-Knopp (transporte optimo) + sesgo dinamico sin aux-loss |
| Modelo base | DeepNarra/Hiraya-1-Base (118M parametros) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone tipo Zamba2 (hibrido, con atencion y componentes recurrentes segun la nomenclatura del autor) con una capa MoE de dos niveles jerarquicos. Cada capa contiene 23 macro-motores, cada uno subdividido en 4 micro-expertos, sumando 92 sub-expertos por capa y 736 en total. El enrutamiento activa 2 macro-motores y 2 micro-expertos por token (4 sub-expertos), a los que se suma un experto fundacional compartido de rango completo que se aplica a todos los tokens para anclar gramatica y logica basica. El balanceo de carga se realiza mediante transporte optimo de Sinkhorn-Knopp combinado con un sesgo dinamico sin perdida auxiliar.

El modelo se obtiene por upcycling del checkpoint Hiraya-1-Base, no por entrenamiento desde cero. Los datasets declarados incluyen HuggingFaceFW/fineweb-edu (preentrenamiento educativo), CohereForAI/aya_collection (multilingue e instrucciones) y m-a-p/CodeFeedback-Filtered-Instruction (codigo). La model card menciona tambien HuggingFaceH4/no_robots para evaluacion de seguimiento de instrucciones y un flujo de razonamiento procedimental generado y verificado con SymPy. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron RLHF o DPO en esta fase; el autor situa el RLHF/GRPO en fases posteriores del linaje (Instruct y Reasoning).

## Capacidades

- Generacion de texto autoregresiva en ingles y capacidad multilingue declarada.
- Razonamiento basico y logica anclada por el experto fundacional compartido.
- Generacion de codigo, con entrenamiento sobre CodeFeedback-Filtered-Instruction.
- Soporte de tool calling y ejecucion de codigo, disenado para ejecutarse dentro del sandbox DeepNarra Airlock con verificacion estatica AST y bloqueo de SSRF.
- Capacidad de agentes autonomos y razonamiento multi-paso, segun el uso previsto declarado.
- Modo de razonamiento latente continuo y decodificacion especulativa como areas de investigacion previstas.
- Memoria recurrente sub-cuadratica (componente Zamba2) para eficiencia en secuencias largas.
- Despliegue en borde mediante cuantizacion BitNet b1.58 GGUF, segun uso previsto.
- No se declara soporte de vision ni audio.

## Casos de uso

- Investigacion en arquitecturas MoE: el modelo sirve como banco de pruebas para estudiar enrutamiento jerarquico de 92 expertos con solo 100M parametros activos, util para experimentos academicos sobre balanceo de carga con Sinkhorn-Knopp.
- Despliegue en dispositivos de borde: con 908M parametros totales y ~100M activos, es candidato para inferencia en CPU o GPU de gama baja mediante cuantizacion, especialmente en el escenario BitNet b1.58 que cita el autor.
- Generacion de codigo asistida en entornos controlados: su entrenamiento con CodeFeedback permite integrarlo en asistentes de programacion dentro de sandboxes con verificacion AST, aunque la calidad no esta validada publicamente.
- Experimentos de decodificacion especulativa: el bajo numero de parametros activos lo hace adecuado como modelo borrador (draft model) en pipelines de decodificacion especulativa junto a modelos mayores.
- Agentes autonomos en sandbox: el diseno con tool calling y airlock de seguridad permite probar flujos de agentes multi-paso en entornos aislados con bloqueo de redes privadas.
- Prototipado de asistentes multilingues de bajo coste: el entrenamiento con aya_collection y su licencia Apache-2.0 facilitan pruebas de concepto multilingues sin restricciones comerciales.
- Educacion e investigacion en eficiencia: util para comparar el rendimiento por parametro activo de MoE jerarquicas frente a transformers densos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente una politica de "cero puntuaciones falsas" y no incluye metricas de MMLU, HumanEval, GSM8K ni similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para pesos (908M parametros), mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB; en 4 bits, aproximadamente 0,5-0,6 GB (estimacion a partir del recuento de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPU de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: si, con margen amplio, e incluso en CPU para inferencia en cuantizacion baja.
- Opciones de despliegue: transformers con carga manual de safetensors (el quickstart del autor usa `safetensors.torch.load_file` en lugar de `AutoModel`); se mencionan GGUF, lo que sugiere compatibilidad con llama.cpp u Ollama, aunque no se confirman artefactos publicados. No hay confirmacion de soporte en vLLM o TGI.
- Latencia y throughput: no disponibles. Con ~100M parametros activos se espera una latencia muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| DeepNarra Hiraya-1-H-MoE | 908M | ~100M | no disponible | Apache-2.0 | MoE jerarquica de 92 expertos, experimental, sin benchmarks |
| Qwen2.5-0.5B | 494M | denso (494M) | 32.768 tokens | Apache-2.0 | Denso, ampliamente validado, con benchmarks publicos |
| SmolLM2-1.7B | 1.700M | denso (1.700M) | 8.192 tokens | Apache-2.0 | Denso, entrenado con datasets abiertos, benchmarks publicos |
| OLMo-1B | 1.176M | denso (1.176M) | 2.048 tokens | Apache-2.0 | Denso, totalmente abierto (datos y codigo) |

La comparacion es orientativa: Hiraya-1-H-MoE es el unico MoE del grupo y el unico sin evaluacion publica, por lo que su rendimiento real frente a estos densos de tamano similar no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de su calidad en tareas estandar, lo que desaconseja su uso en produccion sin evaluacion propia.
- Modelo experimental y muy reciente (creado en octubre de 2026), con 202 descargas y 0 likes; no hay comunidad ni soporte.
- Entrenado con un presupuesto computacional compacto segun el propio autor, que recomienda verificar independientemente las salidas en dominios medicos, legales, financieros o de seguridad critica.
- Riesgo de alucinacion elevado por su tamano reducido (908M totales, ~100M activos) y por la falta de fases de alineacion en esta version (el RLHF/GRPO se situa en fases posteriores del linaje).
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Lista de idiomas no cerrada: solo se declara "ingles" y "multilingue" sin especificar cobertura ni calidad por idioma.
- El quickstart oficial carga pesos manualmente con safetensors en lugar de `AutoModel`, lo que sugiere que la integracion con transformers puede requerir codigo de arquitectura personalizado; verificar compatibilidad antes de desplegar.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de atribucion incluyen HuggingFaceH4/no_robots bajo CC-BY-NC-4.0 (uso no comercial) para evaluacion de instrucciones, lo que conviene revisar segun el uso previsto.
- El tool calling y la ejecucion de codigo estan disenados para un sandbox propietario (DeepNarra Airlock); usarlos fuera de el elimina las garantias de seguridad declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepNarra/Hiraya-1-H-MoE
- Organizacion DeepNarra: https://huggingface.co/DeepNarra
- Modelo base Hiraya-1-Base: https://huggingface.co/DeepNarra/Hiraya-1-Base
- Fase 3 Hiraya-1-Instruct: https://huggingface.co/DeepNarra/Hiraya-1-Instruct
- Fase 4 Hiraya-1-Reasoning: https://huggingface.co/DeepNarra/Hiraya-1-Reasoning
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset CohereForAI/aya_collection: https://huggingface.co/datasets/CohereForAI/aya_collection
- Dataset m-a-p/CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0

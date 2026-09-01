# hipfire-models/maple-preview

## Resumen

Maple-Preview es una compilación del modelo `deepgrove/maple-preview` realizada con el motor de inferencia hipfire, un runtime en Rust con kernels HIP escritos a mano, optimizado exclusivamente para GPUs AMD RDNA. El modelo original es un MoE de razonamiento con 20 mil millones de parámetros totales y 1 mil millones activos (20B-A1B), con pesos ternarios nativos (cada peso es exactamente `-s`, `0` o `+s` con una escala bf16 por fila de salida). Esta build empaqueta esos pesos ternarios en un formato compacto de 2.250 bpw sin pérdida alguna, ya que el cuerpo no es una cuantización sino un "packing" que reproduce exactamente los valores originales.

La relevancia de esta ficha radica en que demuestra cómo un modelo de razonamiento de gran tamaño puede ejecutarse de forma eficiente en hardware AMD, algo poco habitual en el ecosistema dominado por NVIDIA. La compilación incluye un `lm_head` en Q8 por defecto, con overlays opcionales para cabezas Q4K y BF16, y soporta una ventana de contexto de 131.072 tokens. El proyecto es de código abierto con licencia MIT, y el modelo base está disponible en safetensors, mientras que esta build utiliza el formato propietario `.hfq` de hipfire.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos y routing top-8, pesos ternarios nativos |
| Parametros totales | 20B (20.000 millones) |
| Parametros activos | 1B (A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Cuerpo: MQ2G256LloydU (qt=51) a 2.250 bpw; lm_head: Q8 (por defecto), overlays Q4K y BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | `.hfq` (formato propietario de hipfire) |

## Arquitectura y entrenamiento

El modelo base `deepgrove/maple-preview` es un MoE con 256 expertos y routing top-8, donde cada peso lineal es exactamente ternario (`-s`, `0`, `+s`) con una escala bf16 por fila de salida. Esta propiedad permite que la build de hipfire empaquete los pesos sin pérdida: el convertidor rechaza cualquier fila no ternaria en lugar de aplicar una cuantización con pérdida, y se verificó contra los safetensors originales que el error máximo es cero (las únicas diferencias son ceros con signo, numéricamente irrelevantes). El cuerpo utiliza el carrier `MQ2G256LloydU` (qt=51), un formato no rotado diseñado específicamente para almacenar exactamente esos tres niveles.

No se dispone de información sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO). La build de hipfire no modifica los pesos, solo los empaqueta y define el runtime. El `lm_head` se cuantiza por separado: el Q8 por defecto ofrece la misma calidad que BF16 (KL media 0.0511) pero decodifica un 23% más rápido, por lo que BF16 está estrictamente dominado. El modelo comparte tokenizador con Qwen, pero los parámetros de generación recomendados por el vendor (temperatura 1.0, top_p 0.95) difieren de los valores por defecto de Qwen.

## Capacidades

- Generacion de texto y razonamiento: el modelo está diseñado para tareas de razonamiento, como demostraciones matemáticas o lógica simbólica.
- Contexto largo: ventana de 131.072 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Eficiencia en AMD RDNA: ejecución nativa en GPUs AMD mediante kernels HIP, sin dependencias de PyTorch ni Python en el camino crítico.
- Calidad preservada: al ser un empaquetado exacto de pesos ternarios, la pérdida de precisión respecto al modelo original proviene únicamente del runtime (redondeo de activaciones a bf16), no de los pesos.
- Overlays de cabeza: permite intercambiar el `lm_head` entre Q8, Q4K y BF16 sin descargar el cuerpo completo, ajustando el equilibrio entre velocidad y calidad.
- No se documentan capacidades de tool calling, agentes, visión, audio ni soporte multilingüe más allá del inglés.

## Casos de uso

- Razonamiento matematico y logico en entornos AMD: el modelo puede resolver demostraciones (por ejemplo, "Prove that sqrt(2) is irrational") o problemas de algebra, aprovechando la ventana de contexto para incluir todo el enunciado y el historial de razonamiento.
- Analisis de documentos largos: con 131K tokens de contexto, es posible procesar contratos, articulos cientificos o informes extensos en una sola pasada, generando resúmenes o extrayendo conclusiones.
- Generacion de codigo con razonamiento: aunque no se menciona tool calling, el modelo puede generar código o explicar algoritmos complejos, beneficiándose de su capacidad de razonamiento multi-paso.
- Investigacion en eficiencia de inferencia: la build demuestra cómo empaquetar pesos ternarios sin pérdida, sirviendo como referencia para otros proyectos que busquen optimizar MoE en hardware AMD.
- Despliegue en servidores con GPUs AMD RDNA: organizaciones que ya usan infraestructura AMD (por ejemplo, Radeon 8060S / Strix Halo) pueden ejecutar un modelo de 20B con ~145 tok/s de decodificación y ~800 tok/s de prefill en prompts cortos.
- Prototipado de agentes con contexto largo: aunque no hay soporte nativo de agentes, la ventana de 131K permite mantener historiales extensos de interacción, útil para experimentos de razonamiento multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card proporciona metricas de calidad relativas a una referencia BF16 y mediciones de rendimiento en hardware concreto:

| Metrica | Valor |
|---|---|
| KL media vs referencia BF16 (lm_head Q8, KV bf16) | 0.0511 |
| Acuerdo top-1 vs referencia BF16 | 91.9% |
| KL media con KV q8 | 0.0842 |
| Acuerdo top-1 con KV q8 | 90.8% |
| KL media en posicion 0 (sin historial de atencion) | 1.2e-4 |
| Decodificacion (gfx1151, lm_head Q8, bf16 KV) | ~145 tok/s |
| Decodificacion (lm_head Q4K) | ~168 tok/s |
| Decodificacion (lm_head BF16) | ~118 tok/s |
| Prefill (prompts cortos) | ~800 tok/s |

La KL media de 0.0511 está cerca del suelo de precisión del propio runtime de referencia, ya que llama.cpp redondea activaciones a bf16 antes de cada multiplicación de matrices. Una referencia F16 difiere de la BF16 en 0.0357 de KL, del mismo orden que la divergencia total de esta build, lo que sugiere que el modelo es sensible a la precisión de activaciones.

## Requisitos de hardware

- GPU: exclusivamente AMD RDNA. Se ha probado en gfx1151 (Radeon 8060S / Strix Halo). No se menciona soporte para NVIDIA ni para otras arquitecturas.
- VRAM: el archivo principal pesa 6,05 GiB, por lo que cabe en GPUs con al menos 8 GB de VRAM, aunque no se especifica un mínimo oficial. Los overlays de cabeza añaden entre 188 MB (Q4K) y 635 MB (BF16).
- Motor de inferencia: hipfire (Rust, kernels HIP). No es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere el runtime de hipfire.
- Rendimiento medido: ~145 tok/s de decodificación y ~800 tok/s de prefill en gfx1151 con lm_head Q8 y KV bf16.
- Opciones de despliegue: instalación gestionada en Linux mediante `hipfire update`, con soporte para cambiar entre revisiones estables y beta.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (MoE de razonamiento con pesos ternarios). La única comparación directa posible es con el modelo base `deepgrove/maple-preview` en su formato original:

| Caracteristica | hipfire-models/maple-preview | deepgrove/maple-preview (base) |
|---|---|---|
| Formato | `.hfq` (empaquetado ternario) | safetensors (BF16) |
| Tamano del archivo | 6,05 GiB (cuerpo) | 14,1 GB (repo completo) |
| Licencia | MIT | MIT |
| Contexto | 131.072 | 131.072 |
| Hardware objetivo | AMD RDNA (via hipfire) | Multiplataforma (via llama.cpp, etc.) |
| Calidad | KL 0.0511 vs referencia BF16 | Referencia (BF16) |

No se han encontrado otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Hardware restringido: el modelo solo se puede ejecutar con el motor hipfire en GPUs AMD RDNA. No funciona en NVIDIA ni en CPUs sin una conversión previa a otro formato.
- Formato propietario: los pesos `.hfq` solo son utilizables por hipfire; no son compatibles con ecosistemas estándar como HuggingFace Transformers, vLLM u Ollama.
- Idioma: solo se declara soporte para inglés. Aunque comparte tokenizador con Qwen, no hay garantía de calidad en otros idiomas.
- Pérdida de precisión en runtime: la calidad final depende del redondeo de activaciones a bf16 en el motor; el modelo es sensible a la precisión de activaciones, lo que puede afectar a tareas de razonamiento delicadas.
- Sin benchmarks estandar: no hay resultados de MMLU, HumanEval u otros, por lo que es difícil comparar su rendimiento absoluto con otros modelos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas abiertas.
- Sin información sobre sesgos: no se documentan evaluaciones de sesgo ni medidas de mitigación.
- Parámetros de generación específicos: se recomienda usar temperatura 1.0 y top_p 0.95 (valores del vendor), no los de Qwen, para obtener resultados óptimos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hipfire-models/maple-preview
- Modelo base: https://huggingface.co/deepgrove/maple-preview
- Repositorio de hipfire: https://github.com/warpfront/hipfire
- Sitio web de hipfire: https://hipfire.dev/
- Fork de llama.cpp de DeepGrove: https://github.com/deepgrove-ai/llama.cpp

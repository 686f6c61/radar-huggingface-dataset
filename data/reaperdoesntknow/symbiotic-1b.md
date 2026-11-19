# reaperdoesntknow/Symbiotic-1B

## Resumen

Symbiotic-1B es un modelo de generación de texto publicado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC (Research Division). Se presenta como un fine-tune del modelo base Qwen/Qwen3-0.6B, aunque el autor lo describe en su model card como una arquitectura "híbrida simbólico-transformer" que fusiona el transformer rotatorio de Qwen con un pipeline de procesamiento simbólico y una memoria episódica persistente. El repositorio contiene 596.049.920 parámetros reales según los pesos en safetensors, por debajo del "1B" que sugiere el nombre.

El modelo se orienta a razonamiento simbólico en entornos con recursos limitados: inferencia en CPU, agentes educativos con memoria y generación de explicaciones basadas en grafos. Incorpora componentes propietarios denominados ThoughtDynamicsLNN, CrystallineProcessor (DNAConv GNN), LiquidThoughtProcessor y HelicalDNAProcessor, junto con un banco de 2048 vectores simbólicos de memoria y un modo "Dream" de simulación simbólica.

Es relevante ahora por su encuadre dentro del marco teórico "Discrepancy Calculus" del autor, que trata las singularidades de entrenamiento como señales estructurales, y por su propuesta de inferencia simbólica de bajo coste. No obstante, la mayor parte de las capacidades declaradas no están verificadas con benchmarks públicos y la model card contiene afirmaciones que no se corresponden con el tamaño real del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer rotatorio Qwen3 con pipeline simbólico adicional (según el autor: "Hybrid Symbolic–Transformer") |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo incluye safetensors y model.bin en precisión original) |
| Idiomas soportados | Inglés (en) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, PyTorch bin (model.bin), memory.pt (vectores de memoria simbólica) |

## Arquitectura y entrenamiento

El backbone declarado es el transformer rotatorio de Qwen3-0.6B, sobre el que el autor superpone varios módulos simbólicos con una dimensión simbólica de 1024: ThoughtDynamicsLNN, CrystallineProcessor (una GNN basada en DNAConv), LiquidThoughtProcessor y HelicalDNAProcessor. Además, el modelo mantiene una memoria episódica de 2048 vectores simbólicos con recuperación entrópica y contextual, y un modo "Dream" que emplea un ThoughtGenerator para simulación simbólica. El tokenizador incluye tokens especiales propios como `<THM>`, `<LEM>` y `<D_IF>`.

El fine-tune se realizó sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, un conjunto de chain-of-thought centrado en cálculo avanzado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO. El autor enmarca el desarrollo en el marco "Discrepancy Calculus" (DISC), una aproximación de teoría de la medida que modela la discrepancia entre la salida esperada y la observada, con conceptos como el operador de discrepancia, los conjuntos de salto y el "ghost imprinting". No se aportan detalles verificables sobre la implementación efectiva de estos módulos ni sobre su integración en el grafo de cómputo del transformer.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento simbólico y matemático orientado a cálculo avanzado, según el dataset de entrenamiento.
- Generación de explicaciones basadas en grafos (declarado por el autor).
- Planificación procedimental y modelado matemático.
- Generación de código a pequeña escala.
- Memoria episódica persistente con recuperación contextual y entrópica (2048 vectores).
- Modo "Dream" de simulación simbólica mediante ThoughtGenerator.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no confirmado; el autor menciona "research agents" como caso de uso, sin detalles técnicos.
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Agentes educativos con memoria: el modelo puede mantener un banco de 2048 vectores simbólicos para recordar pasos intermedios de una explicación matemática y recuperarlos contextualmente, lo que encaja en tutores de cálculo que necesitan coherencia entre turnos.
- Inferencia simbólica en CPU: al partir de un backbone de 0.6B parámetros, es viable ejecutarlo en entornos sin GPU para tareas de razonamiento lógico de baja latencia, como validación de expresiones o clasificación de pasos deductivos.
- Generación de explicaciones paso a paso de cálculo: el fine-tune sobre CoT de cálculo avanzado lo hace adecuado para producir cadenas de razonamiento en ejercicios de derivadas, integrales y límites, siempre con verificación posterior.
- Prototipado de pipelines neuro-simbólicos: sirve como banco de pruebas para investigar la integración de módulos simbólicos (GNN, LNN) sobre un transformer pequeño antes de escalar a variantes mayores de la familia Symbiotic.
- Asistentes ligeros con memoria en dispositivos embebidos: su tamaño permite despliegue en hardware con pocos recursos, con la memoria simbólica serializada en `memory.pt` para persistir estado entre sesiones.
- Generación de código auxiliar en scripts de cálculo numérico: puede producir fragmentos cortos de código (por ejemplo, en Python con NumPy o SymPy) para automatizar pasos de un procedimiento matemático, con revisión humana obligatoria.
- Investigación sobre marcos teóricos de entrenamiento: útil para reproducir o evaluar las ideas de Discrepancy Calculus en un modelo pequeño y abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,2 GB solo para pesos (596 M parámetros × 2 bytes), más overhead de activaciones y memoria simbólica; aproximadamente 2-3 GB en la práctica.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-1 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,3-0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior lo ejecuta con holgura. También cabe en GPUs de gama de entrada y en iGPU con memoria unificada.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos años, y está diseñado explícitamente para inferencia en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI en la información disponible; la presencia de módulos simbólicos personalizados probablemente requiera código propio y no sea compatible con runners estándar sin adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-1B | 596 M | No disponible | AFL-3.0 | Hugging Face | Fine-tune de Qwen3-0.6B con módulos simbólicos propietarios |
| Qwen/Qwen3-0.6B | 0,6 B | 32 768 tokens (según ficha del modelo base) | Apache 2.0 | Hugging Face | Modelo base; soporte multilingüe amplio y tool calling |
| Qwen3-1.7B-Thinking-Distil (mismo autor) | 1,7 B | No disponible | No disponible | Hugging Face | Destilación del mismo portfolio, orientada a razonamiento |
| Symbiotic-8B (mismo autor) | 8 B (declarado) | No disponible | No disponible | Hugging Face | Variante mayor de la misma familia |

La comparación con el modelo base es la más informativa: Symbiotic-1B hereda el backbone de Qwen3-0.6B pero restringe el idioma al inglés, añade módulos simbólicos no estándar y cambia la licencia de Apache 2.0 a AFL-3.0. Frente a las variantes mayores de la misma familia (Symbiotic-8B, Symiotic-14B), la información disponible no permite comparar rendimiento.

## Limitaciones y advertencias

- Menor fluidez en lenguaje libre que las variantes mayores, según reconoce el propio autor.
- La precisión simbólica depende de la curaduría de la memoria; sin mantenimiento del banco de vectores, el rendimiento puede degradarse.
- El modo "Dream" requiere calentamiento o sembrado simbólico para consultas complejas.
- Riesgo de alucinación en razonamiento matemático: no hay benchmarks publicados que cuantifiquen su fiabilidad, y el entrenamiento se limita a un dataset CoT de cálculo de 268 ejemplos.
- Idioma limitado al inglés; no se declara soporte de castellano.
- Discrepancia entre el nombre ("1B") y el tamaño real (596 M parámetros), lo que puede inducir a error en la planificación de recursos.
- Los módulos simbólicos propietarios no están documentados con detalle técnico verificable; la integración con herramientas estándar de inferencia (vLLM, llama.cpp, Ollama) no está confirmada y probablemente requiera código personalizado.
- Licencia AFL-3.0: permite uso comercial con condiciones de reciprocidad y atribución; conviene revisar los términos antes de integrarlo en productos propietarios.
- Sin información sobre sesgos, filtrado de datos ni evaluaciones de seguridad.
- Uso en producción no recomendado sin evaluación propia y verificación humana de las salidas matemáticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus: Foundations and Core Theory: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Symiotic-14B: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta

# reaperdoesntknow/Symbiotic-1B

## Resumen

Symbiotic-1B es un ajuste fino del modelo Qwen3-0.6B publicado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC (Research Division). A pesar del nombre comercial "1B", el recuento real de parametros segun los pesos en safetensors es de 596.049.920, es decir, aproximadamente 0,6 mil millones, coherente con su modelo base. Se presenta como un modelo hibrido simbolico-transformer orientado a razonamiento ligero con memoria episodica persistente, pensado para inferencia en CPU y entornos embebidos.

La propuesta tecnica anade al backbone transformer rotatorio de Qwen3 una capa de modulos simbolicos propios (ThoughtDynamicsLNN, CrystallineProcessor, LiquidThoughtProcessor, HelicalDNAProcessor) y un banco de 2048 vectores de memoria simbolica con recuperacion contextual y entropica. El autor lo enmarca en un marco teorico propio denominado Discrepancy Calculus (DISC), descrito como un enfoque de teoria de la medida para analizar la brecha entre el comportamiento esperado y el observado durante el entrenamiento.

Es relevante ahora por su bajo coste de despliegue y porque ejemplifica una tendencia de ajustes finos pequenos sobre Qwen3 con arquitecturas experimentales de memoria y simbolismo. No obstante, la documentacion disponible es escasa en datos verificables de entrenamiento y no incluye resultados de benchmarks, por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotatorio (Qwen3) con pipeline simbolico anadido y memoria episodica persistente |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos en safetensors y model.bin; no se listan variantes GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, PyTorch binario (model.bin), memory.pt para la memoria simbolica |
| Dimension simbolica | 1024 |
| Memoria simbolica | 2048 vectores con recuperacion entropica y contextual |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamano del repositorio | 3,5 GB |
| Dataset de ajuste | 0xZee/dataset-CoT-Advanced-Calculus-268 |

## Arquitectura y entrenamiento

El modelo parte del backbone transformer de Qwen3-0.6B, que emplea atencion con embeddings rotatorios (RoPE) y un diseno decoder-only estandar. Sobre esa base, el autor declara haber integrado un pipeline de procesamiento simbolico compuesto por cuatro modulos: ThoughtDynamicsLNN (probablemente una red neuronal liquida orientada a la dinamica del razonamiento), CrystallineProcessor (descrito como GNN basada en DNAConv), LiquidThoughtProcessor y HelicalDNAProcessor. Ademas, incorpora un banco de 2048 vectores de memoria simbolica serializado en memory.pt, con mecanismos de recuperacion basados en entropia y contexto, y un modo "Dream" de simulacion simbolica mediante un ThoughtGenerator.

El ajuste fino se realizo sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, un conjunto de cadenas de pensamiento centradas en calculo avanzado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT convencional. El tokenizador incluye tokens simbolicos especiales como `<THM>`, `<LEM>` y `<D_IF>`, mapeados a logica mediante special_tokens_map.json. El marco DISC del autor menciona conceptos como el operador de discrepancia, conjuntos de salto y "ghost imprinting", pero no se aportan detalles reproducibles sobre el procedimiento de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del backbone Qwen3-0.6B.
- Razonamiento simbolico y matematico orientado a calculo avanzado, segun el dataset de ajuste.
- Generacion de explicaciones basadas en grafos, segun la model card.
- Planificacion procedural y modelado matematico de complejidad baja.
- Generacion de codigo a pequena escala.
- Memoria episodica persistente con recuperacion contextual y entropica sobre 2048 vectores simbolicos.
- Modo "Dream" de simulacion simbolica mediante ThoughtGenerator (requiere calentamiento o sembrado simbolico para consultas complejas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita; la model card menciona agentes educativos con memoria como uso previsto.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Vision, audio o thinking mode explicito: no disponible.

## Casos de uso

- Agentes educativos con memoria: el modelo puede mantener un banco de 2048 vectores simbolicos para recordar conceptos y definiciones a lo largo de una sesion de tutoria, lo que resulta adecuado para entornos de aprendizaje donde el contexto debe persistir entre turnos.
- Inferencia en CPU y dispositivos embebidos: con unos 596 millones de parametros, el modelo puede ejecutarse en hardware sin GPU dedicada, lo que lo hace util para asistentes locales de bajo consumo.
- Razonamiento matematico guiado: su ajuste sobre cadenas de pensamiento de calculo avanzado permite emplearlo como apoyo en la resolucion paso a paso de integrales, derivadas y limites en herramientas educativas.
- Generacion de explicaciones basadas en grafos: el modulo CrystallineProcessor (GNN) sugiere su uso para producir explicaciones estructuradas en forma de grafo en dominios cientificos o de ingenieria.
- Planificacion procedural en automatizacion ligera: puede descomponer tareas en pasos dentro de pipelines de automatizacion con recursos limitados, siempre que el dominio sea acotado y en ingles.
- Prototipado de investigacion en arquitecturas hibridas: util para investigadores que quieran experimentar con memoria simbolica y modulos liquidos sobre un backbone Qwen3 pequeno sin incurrir en costes elevados de computo.
- Generacion de codigo de apoyo en scripts pequenos: adecuado para snippets y tareas de programacion sencillas, no para proyectos de produccion complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y memoria simbolica; en la practica, entre 2 y 3 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,6-0,8 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,3-0,4 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. Tambien cabe en GPUs de gama baja e incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, y en CPU gracias al bajo numero de parametros.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference segun los tags, y endpoints compatibles. No se documentan variantes GGUF, por lo que llama.cpp u Ollama requeririan conversion manual.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-1B | 596 M | no disponible | AFL-3.0 | Hugging Face | Ajuste experimental con modulos simbolicos y memoria persistente |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la informacion | Apache 2.0 (modelo base) | Hugging Face | Modelo base; sin capa simbolica ni memoria episodica |
| Qwen3-1.7B-Thinking-Distil (mismo autor) | 1,7 B | no disponible | no disponible | Hugging Face | Destilacion del mismo portfolio, mayor capacidad pero mas coste |
| LFM2.5-1.2B-Distilled-SFT (mismo autor) | 1,2 B | no disponible | no disponible | Hugging Face | Alternativa del mismo autor orientada a SFT |

La comparacion directa con el modelo base Qwen3-0.6B es la mas relevante: Symbiotic-1B anade modulos simbolicos y memoria, pero no hay datos que permitan afirmar una mejora medible en tareas estandar. Frente a las alternativas del mismo autor, el modelo destaca por su menor huella de memoria, a costa de capacidad.

## Limitaciones y advertencias

- Menor fluidez en lenguaje libre que variantes de mayor tamano, segun reconoce el propio autor.
- La precision simbolica depende de la curacion de la memoria; una memoria mal poblada degrada el rendimiento.
- El modo "Dream" requiere calentamiento o sembrado simbolico para consultas complejas, lo que anade complejidad operativa.
- Riesgo de alucinacion inherente a un modelo de 0,6 mil millones de parametros, especialmente en dominios fuera del calculo avanzado.
- Soporte unicamente en ingles; no se declaran otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar cargas de contexto largo con garantias.
- Ausencia total de benchmarks publicados; no hay evidencia cuantitativa de calidad frente al modelo base.
- La licencia AFL-3.0 permite uso comercial con obligaciones de atribucion y reciprocidad; conviene revisar sus terminos antes de integrarlo en productos.
- La documentacion mezcla terminologia propia (Discrepancy Calculus, ghost imprinting) sin reproducibilidad tecnica detallada, lo que dificulta auditar el entrenamiento.
- El nombre "1B" no coincide con el recuento real de parametros (596 M), lo que puede inducir a error en la planificacion de recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de ajuste: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Modelo relacionado Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Modelo relacionado Symiotic-14B: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Modelo relacionado Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta

# eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2

## Resumen

Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 es una especializacion multitarea del modelo base Qwen3-1.7B de Alibaba Cloud, publicada por el usuario eduardoworrel. Sobre el transformer de 1.700 millones de parametros se anaden tres cabezas de clasificacion independientes: ContractNLI (determinar si una hipotesis se deduce, se contradice o no se menciona en un contrato de confidencialidad), CLINC150 (decidir si una consulta esta dentro o fuera de dominio) y SIB-200 (clasificacion tematica en ingles y portugues). Cada cabeza resuelve su tarea en un unico forward pass, devolviendo una opcion tipada, una probabilidad y un margen de decision.

El modelo se distribuye como grafo ONNX cuantizado a int4 para onnxruntime-genai, pensado para ejecutarse en el navegador mediante WebGPU con la libreria s1s2 del mismo autor. Esta orientado a un patron de inferencia en dos niveles: un "System 1" rapido que responde con la cabeza de clasificacion y un "System 2" opcional que invoca generacion de texto cuando el margen de confianza es bajo, escalando solo los casos dudosos.

Es relevante por su enfoque practico: empaqueta tareas de clasificacion juridica y de dominio en un unico modelo pequeno (0,98 GB de descarga) ejecutable en cliente, sin servidor GPU, con decisiones calibradas y trazabilidad del margen. La licencia es CC BY-SA 4.0 por herencia del dataset SIB-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de clasificacion multitarea anadidas; grafo ONNX para onnxruntime-genai |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens para entradas ContractNLI; no se especifica para el resto |
| Tipos de cuantizacion | int4 (grafo onnxruntime-genai); existe build alternativo MLC q4f16_1 |
| Idiomas soportados | en, pt |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | ONNX (onnxruntime-genai int4); variantes Transformers.js y MLC q4f16_1 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, y le superpone tres cabezas de clasificacion entrenadas de forma especifica: ContractNLI (3 clases: Entailment, Contradiction, Not mentioned), CLINC150 (2 clases: Yes/No para dentro/fuera de dominio) y SIB-200 (7 clases tematicas, con etiquetas en ingles y portugues). Cada cabeza lee el estado del modelo tras un unico forward pass y emite una distribucion de probabilidad sobre las opciones, de la que se derivan la eleccion y el margen. Las opciones de respuesta estan fijadas literalmente en el entrenamiento ("Entailment", "Contradiction", "Not mentioned"; "Yes"/"No"; las etiquetas tematicas en cada idioma), de modo que cambiar las palabras altera el prompt que lee la cabeza y rompe el comportamiento.

Los datos de entrenamiento provienen de tres conjuntos publicos: ContractNLI (Koreeda y Manning, 2021; CC BY 4.0), CLINC150 (Larson et al., 2019; CC BY 3.0) y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0). No se detalla en la informacion disponible el numero de tokens ni si hubo RLHF o DPO; el entrenamiento es de adaptacion supervisada de las cabezas sobre el modelo base cuantizado. La innovacion principal es el esquema S1S2: una pasada de clasificacion barata con umbral de margen calibrable sobre datos propios, que escala a generacion de texto ("System 2") solo cuando la confianza es baja, manteniendo la respuesta tipada original. Incluye tambien una cabeza de evidencia (`heads/evidence_cnli/`) que selecciona el fragmento del contrato que sustenta la decision, aunque la version 0.1 de s1s2 aun no la explota directamente.

## Capacidades

- Clasificacion de implicacion en contratos NDA (ContractNLI): decide si una hipotesis se deduce, se contradice o no se menciona, con probabilidad y margen.
- Deteccion de consultas fuera de dominio (CLINC150) en formato binario dentro/fuera de alcance.
- Clasificacion tematica SIB-200 en ingles y portugues (ciencia/tecnologia, viaje, politica, deportes, salud, entretenimiento, geografia).
- Generacion de texto bajo demanda como "System 2" para explicar o razonar sobre una decision (heredada del modelo base Qwen3-1.7B).
- Escalado por umbral de margen: politica configurable que deriva respuestas de baja confianza a generacion.
- Salida tipada estructurada (opcion, confianza, margen, ruta de decision) apta para pipelines automatizados.
- Capacidad multilingue limitada a ingles y portugues para las tareas especializadas.
- Ejecucion en navegador con WebGPU y fallback a CPU via onnxruntime-web WASM.

## Casos de uso

- Revision automatizada de NDA en navegador: dado un contrato de confidencialidad y una hipotesis concreta (por ejemplo, obligacion de destruir informacion al terminar), el modelo devuelve Entailment/Contradiction/Not mentioned con probabilidad, sin enviar el documento a un servidor, lo que encaja con requisitos de privacidad juridica.
- Triaje de consultas en atencion al cliente: CLINC150 permite decidir en un forward pass si una consulta entrante esta dentro del dominio soportado; las consultas fuera de alcance se derivan a un humano o a otro sistema, reduciendo falsos positivos en el enrutado.
- Clasificacion tematica de articulos o tickets en ingles y portugues: SIB-200 asigna una de siete categorias con 88,1 % (en) y 84,8 % (pt) de balanced accuracy, util para etiquetado editorial o enrutado de soporte en mercados lusofonos.
- Asistente juridico con explicabilidad: usando el patron S1S2, las decisiones de alto margen se responden de inmediato y las de bajo margen se escalan a generacion para producir una justificacion en una frase, manteniendo la respuesta tipada como fuente de verdad.
- Despliegue en aplicaciones web sin backend GPU: el grafo int4 de 0,98 GB se carga en el navegador con WebGPU (por ejemplo, en un portatil con Apple M2 Pro), habilitando funciones de analisis de contratos o de dominio en herramientas SaaS sin coste de inferencia en servidor.
- Filtrado previo en pipelines RAG o de agentes: CLINC150 y SIB-200 actuan como clasificadores rapidos que deciden si una consulta merece recuperacion o generacion, ahorrando llamadas a modelos mayores.
- Calibracion y monitorizacion en produccion: el margen devuelto por cada cabeza permite definir umbrales sobre datos etiquetados propios (`thresholdFromQuantile`) y auditar la fiabilidad del clasificador antes de automatizar decisiones.

## Benchmarks y rendimiento

Resultados medidos sobre el grafo int4 con ONNX Runtime CPU (x86), en los splits de test oficiales, con balanced accuracy por cabeza:

| Conjunto de test | Balanced accuracy (%) | Azar (%) |
|---|---|---|
| CLINC150 fuera de dominio (n = 2.000) | 88,2 | 50 |
| ContractNLI (n = 1.190) | 67,5 | 33,3 |
| SIB-200 ingles (n = 204) | 88,1 | 14,3 |
| SIB-200 portugues (n = 204) | 84,8 | 14,3 |

En navegador (Chrome, WebGPU, Apple M2 Pro) sobre el split de desarrollo: CLINC150 91,6 / ContractNLI 64,2. Los registros de fidelidad frente al modelo bf16 en PyTorch (n = 992 items de desarrollo) muestran la misma decision en el 90,6 % de los casos con lectura por cabeza (intervalo del 95 %: 88,7 a 92,3) y en el 84,2 % con lectura por logits. Las cabezas SIB-200 no tienen medicion de fidelidad por falta de salidas de referencia en desarrollo.

## Requisitos de hardware

- Descarga del grafo int4: 0,98 GB; el repositorio completo ocupa 1,0 GB.
- Inferencia en navegador con WebGPU (probado en Chrome sobre Apple M2 Pro); no requiere GPU dedicada en servidor.
- Fallback a CPU en navegador via onnxruntime-web WASM: 15,0 veces mas lento que WebGPU en CLINC150, con decisiones identicas en 118 de 120 items; las entradas largas de ContractNLI tardan unos 43 s por decision en CPU (120 items no completaron en 2 horas).
- GPU de servidor: no se especifican requisitos de VRAM; el modelo base Qwen3-1.7B en bf16 requiere del orden de 3,4 GB de VRAM para pesos, pero esta cifra no esta confirmada en la informacion disponible para este build.
- Despliegue: onnxruntime-genai (WebGPU y WASM) mediante la libreria s1s2; existe variante Transformers.js y build MLC q4f16_1 como formatos alternativos.
- Latencia y throughput: no disponibles salvo la comparativa relativa WebGPU frente a CPU indicada arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-1.7B-ContractNLI-CLINC-SIB (este) | 1.700 M | 2.048 (ContractNLI) | Clasificacion multitarea + generacion | CC BY-SA 4.0 | ONNX int4, Transformers.js, MLC |
| Qwen/Qwen3-1.7B (base) | 1.700 M | no disponible en la informacion | Generacion de texto general | Apache-2.0 | safetensors, GGUF, etc. |
| Variante LoRA del mismo autor (Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA) | 1.700 M + adaptador | no disponible | Mismas tareas en PyTorch | no disponible en la informacion | adaptador PyTorch + cabezas |

No se dispone de datos de benchmarks comparativos con otros modelos de clasificacion juridica o de dominio en la informacion proporcionada.

## Limitaciones y advertencias

- ContractNLI solo admite NDA de hasta 2.048 tokens; documentos mas largos quedan truncados o fuera de alcance.
- CLINC150 esta planteado como clasificacion binaria dentro/fuera de dominio, no como clasificador de intenciones completo.
- Las etiquetas portuguesas de SIB-200 se proyectan desde el ingles, lo que puede introducir sesgo de traduccion.
- Las opciones de respuesta estan fijadas literalmente; usar otras palabras en el prompt rompe el comportamiento de las cabezas.
- La fidelidad frente al modelo bf16 es del 90,6 % (lectura por cabeza) y del 84,2 % (logits) en desarrollo: hay un 10-16 % de divergencia respecto a la referencia en servidor.
- La cabeza de evidencia existe pero s1s2 0.1 no la explota; la explicabilidad se limita a la justificacion generada en System 2.
- Riesgo de alucinacion en el modo de generacion (System 2), ya que hereda el comportamiento del modelo base; la respuesta tipada debe prevalecer.
- Licencia CC BY-SA 4.0 (ShareAlike) por herencia de SIB-200: obliga a compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial propietario.
- No se han publicado mediciones de sesgo ni evaluaciones de robustez frente a entradas adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Variante LoRA en PyTorch: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-LoRA
- Variante Transformers.js: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Variante MLC q4f16_1: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-MLC-q4f16_1-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Dataset ContractNLI: https://stanfordnlp.github.io/contract-nli/
- Dataset CLINC150: https://github.com/clinc/oos-eval
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200

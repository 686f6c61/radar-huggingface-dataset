# GhostScientist/semanticwiki-14b-v3-qwen3

## Resumen

SemanticWiki 14B v3 (Qwen3) es un adaptador LoRA de ajuste supervisado (SFT) construido sobre Qwen/Qwen3-14B por el usuario GhostScientist. Su objetivo es generar paginas de documentacion de arquitectura de software al estilo DeepWiki: paginas wiki estructuradas por secciones, con diagramas Mermaid y, sobre todo, afirmaciones factuales acompanadas de citas verificables en formato `path/fichero.ext:linea` o `path:inicio-fin` que resuelven contra el repositorio real de origen.

El modelo no es un modelo completo, sino un adaptador PEFT de aproximadamente 1 GB publicado junto al modelo base. Se entreno sobre 313 paginas procedentes de 97 repositorios reales de GitHub, con verificacion determinista de cada cita, durante 2 epocas con rango LoRA 64 y una longitud de secuencia maxima de 24.576 tokens. La receta es identica a la del adaptador hermano semanticwiki-coder-14b-v3, pero aplicada a la familia Qwen3 en lugar de Qwen2.5-Coder.

Su relevancia actual es fundamentalmente metodologica: el autor publica este adaptador como el brazo negativo de una ablacion. En la evaluacion emparejada SemanticWiki-Eval v3, el fine-tuning empeoro todas las metricas respecto al modelo base Qwen3-14B (validez de citas 0,385 frente a 0,501; fidelidad 3,50 frente a 3,77). El propio autor recomienda no usarlo en produccion y emplear en su lugar el modelo base con un system prompt de citacion estricta, o el adaptador sobre Qwen2.5-Coder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (adaptador LoRA sobre Qwen/Qwen3-14B); decoder-only con atencion por grupos (GQA, segun el modelo base) |
| Parametros totales | 14,8 B en el modelo base; el adaptador LoRA tiene un rango r=64 sobre todas las proyecciones lineales (numero exacto de parametros entrenables: no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-14B (extensible a 131.072 con YaRN, segun el modelo base); el adaptador se entreno con longitud maxima de secuencia de 24.576 tokens |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors). El modelo base Qwen3-14B dispone de cuantizaciones GGUF, AWQ y GPTQ en el ecosistema, no verificadas para este adaptador |
| Idiomas soportados | No disponible (no declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere cargar el modelo base Qwen/Qwen3-14B) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3-14B, un transformer decoder-only denso de 14,8 B parametros. El adaptador aplica rango r=64, alpha=128 y dropout 0,05 sobre todas las proyecciones lineales del modelo base (atencion y MLP), y se entrena con perdida completion-only en formato prompt-completion, de modo que el gradiente solo se calcula sobre la respuesta generada y no sobre el contexto de codigo de entrada. La receta usa 2 epocas, learning rate 1e-4 con scheduler coseno y batch efectivo de 16, con una longitud maxima de secuencia de 24.576 tokens. La perdida final reportada es 0,4891 y la precision por token (token accuracy) 0,829.

El conjunto de entrenamiento, GhostScientist/semanticwiki-data-v3, consta de 313 paginas wiki generadas a partir de 97 repositorios reales de GitHub, con cada cita `path:line` verificada de forma determinista contra el repositorio. El objetivo de entrenamiento es producir secciones estructuradas, diagramas Mermaid y afirmaciones trazables a lineas concretas del codigo. La innovacion tecnica del proyecto reside en el formato de citacion verificable y en el protocolo de evaluacion pareada, no en la arquitectura: no se emplean decodificacion especulativa, atencion lineal ni mecanismos hibridos. El autor no reporta RLHF ni DPO, solo SFT.

## Capacidades

- Generacion de documentacion tecnica estructurada: paginas wiki de arquitectura al estilo DeepWiki, con secciones definidas y diagramas Mermaid.
- Citacion verificable a nivel de linea: emite referencias `path/fichero.ext:linea` o `path:inicio-fin` que resuelven contra el repositorio de origen.
- Procesamiento de contexto de codigo con numeracion de lineas, siguiendo la misma plantilla de entrada que semanticwiki-coder-14b-v3.
- Manejo de contextos largos en el entrenamiento (hasta 24.576 tokens), heredando la ventana nativa de 32.768 tokens de Qwen3-14B.
- Capacidades heredadas del modelo base Qwen3-14B: generacion de texto, razonamiento, codigo y matematicas (no validadas de forma especifica en este adaptador).
- Tool calling / function calling: no disponible de forma especifica para este adaptador; el modelo base lo soporta, pero el ajuste no lo evalua.
- Uso en agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan declarados en la model card).
- Capacidad especial: no dispone de modo "thinking" documentado ni de soporte de vision o audio.

## Casos de uso

- Documentacion automatica de repositorios internos: generar paginas wiki de arquitectura a partir de un contexto de codigo numerado por lineas, con citas que un revisor humano puede abrir directamente en el fichero y la linea indicados. Es el caso de uso disenado del modelo.
- Auditoria de trazabilidad documental: usar el formato de citacion estricta para verificar que cada afirmacion de una pagina wiki corresponde a codigo existente, integrandolo en un pipeline de validacion que resuelva las citas contra el repositorio.
- Generacion de diagramas de arquitectura: producir diagramas Mermaid de flujos de datos y dependencias entre modulos junto con el texto explicativo.
- Investigacion sobre alineacion y sobreajuste: utilizar el adaptador como brazo negativo documentado en experimentos sobre cuando el SFT con pocos ejemplos degrada a un modelo base ya competente. El dataset de evaluacion es publico.
- Reproduccion de ablaciones: replicar la receta LoRA (r=64, alpha=128, 2 epocas, 313 ejemplos) sobre otras familias de modelos para comparar curvas de regresion frente a mejora.
- Generacion de documentacion en el punto de merge (CI): integrarlo como paso opcional que redacta un borrador de pagina wiki cuando se modifica un modulo, aceptando revision humana obligatoria dado su nivel de fidelidad medido (3,50 sobre 5).
- No recomendado: documentacion dirigida a usuarios finales sin revision, dado que la validez de citas medida es 0,385 y la mayoria de las citas generadas no resuelven correctamente.

## Benchmarks y rendimiento

Evaluacion emparejada SemanticWiki-Eval v3, sobre 13 repositorios reservados y 26 paginas:

| Brazo | Formato | Validez de citas | Fidelidad (juez 1-5) | Citas por pagina |
|---|---:|---:|---:|---:|
| Este modelo (adaptador v3) | 0,779 | 0,385 | 3,50 | 4,2 |
| Qwen3-14B (base) | 0,808 | 0,501 | 3,77 | 5,3 |

El autor reporta el resultado como negativo: el fine-tuning empeoro todas las metricas de la familia Qwen3-14B. La interpretacion dada en la model card es que el modelo base ya era un mejor seguidor de instrucciones y que 313 ejemplos durante 2 epocas provocaron sobreajuste a la distribucion de entrenamiento. Para la familia Qwen2.5-Coder la misma receta mejoro todas las metricas (ver semanticwiki-coder-14b-v3). No se han publicado otros resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en precision completa: aproximadamente 30 GB en FP16/BF16 (14,8 B parametros). Estimacion orientativa, no publicada por el autor.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 15-16 GB. En 4 bits: aproximadamente 9-10 GB. Estimaciones orientativas, no verificadas para este adaptador.
- El adaptador LoRA en si ocupa el repositorio declarado de 1,0 GB, aunque los pesos efectivos del adaptador con r=64 sobre todas las lineales del modelo base son sustancialmente menores; el peso total en inferencia lo determina el modelo base.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para FP16/BF16. Para cuantizacion 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) resulta suficiente.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers con PEFT (ruta oficial, ya que es un adaptador LoRA), vLLM y TGI admiten adaptadores LoRA en algunos modos; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertirlo a GGUF. No hay recetas de despliegue publicadas en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Validez de citas | Fidelidad (1-5) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| semanticwiki-14b-v3-qwen3 (este) | 14,8 B + LoRA | 24.576 entrenamiento / 32.768 base | 0,385 | 3,50 | Apache-2.0 | Publicado en HuggingFace |
| Qwen/Qwen3-14B (base) | 14,8 B | 32.768 (131.072 con YaRN) | 0,501 | 3,77 | Apache-2.0 | Publicado en HuggingFace |
| semanticwiki-coder-14b-v3 | 14,8 B + LoRA sobre Qwen2.5-Coder | No disponible | No disponible (mejora en todos los ejes, sin cifras en esta ficha) | No disponible | Apache-2.0 | Publicado en HuggingFace |

El autor indica explicitamente que semanticwiki-coder-14b-v3 es "el mejor modelo SemanticWiki en conjunto" y que para una solucion basada en Qwen3 conviene usar el modelo base con el system prompt de citacion estricta.

## Limitaciones y advertencias

- Regresion medida: el ajuste empeora formato, validez de citas, fidelidad y numero de citas por pagina respecto al modelo base Qwen3-14B. No es una eleccion recomendable para produccion.
- Sobreajuste: 313 ejemplos durante 2 epocas sobre un modelo base ya competente producen adaptacion excesiva a la distribucion de entrenamiento.
- Alucinacion de citas: la validez de citas de 0,385 implica que mas de la mitad de las referencias `path:line` generadas no resuelven correctamente contra el repositorio. Toda salida debe validarse de forma automatica.
- Sesgos conocidos: no disponibles. El conjunto de entrenamiento procede de 97 repositorios de GitHub, con el sesgo de dominio que ello implica (lenguajes y convenciones presentes en esos repos).
- Limitaciones de idioma: no disponibles; la model card no declara idiomas soportados.
- Restriccion de licencia: Apache-2.0 permite uso comercial, pero al ser un adaptador derivado de Qwen/Qwen3-14B el uso combinado queda sujeto tambien a la licencia del modelo base (Apache-2.0).
- Publicado como brazo negativo de una ablacion; el autor desaconseja su uso directo.
- Contexto de entrenamiento inferior a la ventana nativa del modelo base: 24.576 frente a 32.768 tokens, por lo que el comportamiento mas alla de esa longitud no esta entrenado.
- Compatibilidad: requiere PEFT 0.21.2 y TRL 1.14.1 / Transformers 5.18.0 segun la model card; versiones significativamente distintas de transformers pueden no cargar el adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GhostScientist/semanticwiki-14b-v3-qwen3
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de entrenamiento semanticwiki-data-v3: https://huggingface.co/datasets/semanticwiki-data-v3
- Dataset de evaluacion semanticwiki-eval-v3: https://huggingface.co/datasets/semanticwiki-eval-v3
- Adaptador hermano semanticwiki-coder-14b-v3: https://huggingface.co/GhostScientist/semanticwiki-coder-14b-v3
- Repositorio TRL (framework de entrenamiento): https://github.com/huggingface/trl

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces anteriores proceden exclusivamente de la informacion del repositorio de HuggingFace.

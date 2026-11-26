# cotulabs/CoTu-EXACT26-GRM-2.5-Logic

## Resumen

CoTu-EXACT26-GRM-2.5-Logic es un ajuste fino (SFT) del modelo OrionLLM/GRM-2.5, desarrollado por cotulabs, orientado a razonamiento neuro-simbolico con enfasis en logica formal. El modelo parte de una arquitectura Qwen3.5 multimodal (image-text-to-text) y se ha entrenado con TRL para tareas de razonamiento estructurado que combinan el razonamiento en lenguaje natural con la verificacion simbolica mediante Z3, un solver SMT ampliamente utilizado en verificacion formal.

Con aproximadamente 4.540 millones de parametros (4,54 B) y un repositorio de 9,1 GB en formato safetensors, el modelo se posiciona en la gama media de modelos de razonamiento. Su interes radica en la combinacion de capacidades multimodales heredadas del modelo base con un entrenamiento especifico para logica y demostracion formal, un nicho poco cubierto por los modelos generalistas.

Es relevante ahora porque la integracion de solvers simbolicos (Z3) con modelos de lenguaje es una linea activa de investigacion para reducir alucinaciones en tareas de razonamiento verificable. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y licencia GPL-3.0, lo que condiciona fuertemente su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia qwen3_5 |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |
| Modelo base | OrionLLM/GRM-2.5 |
| Metodo de entrenamiento | SFT con TRL |
| Modalidades de entrada | texto e imagen |
| Acceso | restringido (gated) |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base OrionLLM/GRM-2.5, etiquetado en Hugging Face con la familia `qwen3_5`, lo que sugiere un transformer de tipo decoder-only con soporte multimodal para entrada de imagen y texto (`image-text-to-text`). El ajuste fino se ha realizado mediante SFT (supervised fine-tuning) con la libreria TRL, partiendo de los pesos del modelo base.

La innovacion declarada es el enfoque neuro-simbolico: el modelo esta disenado para combinar razonamiento en lenguaje natural con verificacion formal mediante Z3, un solver de satisfacibilidad modulo teorias. Los tags del repositorio incluyen `neuro-symbolic`, `reasoning` y `z3`, y se referencia el paper arXiv:2607.14735. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales al SFT.

## Capacidades

- Generacion de texto conversacional (`text-generation`, `conversational`).
- Razonamiento logico y formal, con integracion declarada de verificacion simbolica mediante Z3.
- Procesamiento multimodal de entrada: texto e imagen (`image-text-to-text`).
- Razonamiento multi-paso orientado a problemas de logica.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Verificacion de especificaciones formales: el modelo puede traducir requisitos en lenguaje natural a formulas verificables y delegar la comprobacion en Z3, lo que resulta adecuado para validar invariantes en sistemas criticos.
- Asistencia en demostracion matematica y logica: dado su entrenamiento especifico en logica, puede emplearse para generar bocetos de demostracion y comprobar pasos deductivos con el solver.
- Analisis de documentacion tecnica con imagenes: al aceptar entrada image-text-to-text, permite extraer y razonar sobre diagramas, tablas o esquemas junto con texto asociado.
- Generacion de tests y aserciones para codigo: el enfoque neuro-simbolico facilita proponer precondiciones y postcondiciones verificables en pipelines de integracion continua.
- Educacion en logica y matematicas discretas: puede servir como tutor que justifica cada paso y verifica la correccion formal de las respuestas del estudiante.
- Investigacion en neuro-simbolico: como punto de partida para experimentos que comparen razonamiento puramente neuronal frente a razonamiento asistido por solver, dado que su ajuste esta orientado explicitamente a esa tarea.
- Auditoria de reglas de negocio: traduccion de politicas expresadas en lenguaje natural a restricciones SMT para detectar contradicciones o casos no cubiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 B de parametros, en FP16 se requieren aproximadamente 9,1 GB de pesos mas overhead de activaciones y KV cache; en cuantizacion de 8 bits, en torno a 4,5-5 GB; en 4 bits, aproximadamente 2,3-3 GB. Estas cifras son estimaciones a partir del tamano del repositorio, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en FP16 con contexto largo y concurrencia; RTX 4090 (24 GB) o L40S para FP16 en una sola GPU.
- GPU de consumo: cabe en GPUs consumer con 8 GB o mas en cuantizacion de 4-8 bits (por ejemplo RTX 3060 Ti, RTX 4060, RTX 4070); en FP16 requiere al menos 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090).
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de vLLM o TGI para servidores; llama.cpp u Ollama requeririan conversion a GGUF, no confirmada en el repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos confirmados del modelo y deja como no disponible la comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| CoTu-EXACT26-GRM-2.5-Logic | 4,54 B | no disponible | GPL-3.0 | gated | SFT sobre GRM-2.5, enfoque neuro-simbolico con Z3 |
| OrionLLM/GRM-2.5 (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del ajuste |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la informacion disponible |

## Limitaciones y advertencias

- Licencia GPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con integraciones en productos propietarios; requiere revision legal antes de uso comercial.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade friccion a la evaluacion y al despliegue automatizado.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: aunque el enfoque neuro-simbolico busca mitigarlo mediante Z3, no se han publicado tasas de error ni evaluaciones de fidelidad; la verificacion depende de que el modelo formule correctamente las restricciones.
- Longitud de contexto y cuantizaciones soportadas no documentadas, lo que dificulta planificar despliegues con requisitos de memoria concretos.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que desaconseja su adopcion en produccion sin una evaluacion propia.
- Cero descargas y cero likes en Hugging Face: modelo muy reciente y sin validacion por parte de la comunidad.
- Los datos de fecha de creacion (2026-11-26) y el identificador arXiv:2607.14735 no han podido contrastarse de forma independiente; conviene verificar su vigencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cotulabs/CoTu-EXACT26-GRM-2.5-Logic
- Modelo base: https://huggingface.co/OrionLLM/GRM-2.5
- Paper referenciado: https://arxiv.org/abs/2607.14735
- Repositorio de TRL: https://github.com/huggingface/trl
- Solver Z3: https://github.com/Z3Prover/z3

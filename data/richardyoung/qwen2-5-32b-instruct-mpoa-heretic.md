# richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. El objetivo declarado del autor es producir una variante "descenSorada" o "abliterated": un modelo al que se le han reducido o eliminado los mecanismos de rechazo y alineacion de seguridad del modelo original, de modo que responda a peticiones que el modelo base rechazaria. La tecnica empleada se etiqueta como MPOA y heretic, y el autor la describe como reproducible.

El modelo conserva la arquitectura del Qwen2.5-32B-Instruct original: un transformer denso de aproximadamente 32.760 millones de parametros, con licencia Apache 2.0 y pesos en safetensors. El repositorio ocupa 65,5 GB y esta marcado como acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. Solo declara soporte para ingles.

Su relevancia es acotada y de nicho: interesa a investigadores que estudian el comportamiento de modelos sin alineacion, a quienes necesitan evaluar la eficacia de tecnicas de abliteration y a desarrolladores que quieren comparar el modelo base con su variante modificada. No es un modelo recomendable para produccion orientada al publico general, dado que la eliminacion de los rechazos incrementa el riesgo de generar contenido danino, sesgado o inexacto sin advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (solo ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso de la familia Qwen2.5, con atencion por causalidad estandar, RoPE y capas de normalizacion RMSNorm. El ajuste realizado por richardyoung no cambia la arquitectura ni el numero de parametros: modifica los pesos para alterar el comportamiento de rechazo. La informacion disponible no detalla el dataset de ajuste, el numero de tokens utilizados ni si se empleo RLHF o DPO en esta fase; solo se indica que la metodologia MPOA/heretic es reproducible.

Las etiquetas del repositorio incluyen referencias a tres articulos (arXiv:2309.00071, arXiv:2407.10671 y arXiv:2611.17846), que probablemente documentan la tecnica de abliteration o el proceso de evaluacion, aunque no se dispone de su contenido en la informacion proporcionada. No se han publicado detalles sobre la composicion del corpus de ajuste ni sobre posibles evaluaciones de seguridad posteriores.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas del modelo base Qwen2.5-32B-Instruct.
- Razonamiento, matematicas y generacion de codigo a nivel del modelo base (no se han publicado evaluaciones especificas de esta variante).
- Respuestas a peticiones que el modelo original rechazaria, por la reduccion de los mecanismos de rechazo (comportamiento "uncensored"/"abliterated").
- Soporte de tool calling y function calling heredado del modelo base, aunque no verificado en esta variante.
- Capacidades de agente y razonamiento multi-paso, presumiblemente heredadas, sin documentacion especifica.
- Capacidades multilingues limitadas al ingles segun la ficha del repositorio.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar las respuestas del modelo base con las de esta variante para medir el efecto de la abliteration en la tasa de rechazos y en la calidad de las respuestas.
- Evaluacion de tecnicas de desalineacion: usar el modelo como referencia reproducible para validar la metodologia MPOA/heretic descrita por el autor.
- Red teaming controlado: generar respuestas a peticiones sensibles en un entorno aislado para estudiar vectores de ataque y disenar filtros de salida.
- Analisis de sesgos: examinar como cambia el comportamiento del modelo en temas delicados tras eliminar los rechazos, comparandolo con el original.
- Generacion de codigo en pipelines internos: el modelo base es competente en programacion y tool calling; esta variante puede usarse en entornos cerrados donde no se requiera moderacion automatica.
- Experimentacion con tecnicas de cuantizacion y despliegue: al ser un modelo de 32B en safetensors, sirve para probar pipelines de inferencia (vLLM, TGI) con pesos modificados.
- Docencia y divulgacion: ilustrar en charlas o cursos como se modifica un modelo alineado y que consecuencias tiene, siempre con ejemplos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 65 GB solo para pesos, mas overhead de KV cache; se recomienda un minimo de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 35-40 GB; en 4 bits, alrededor de 20-25 GB (estimaciones genericas para un modelo de 32B, no verificadas para esta variante).
- GPU recomendadas: A100 80 GB, H100 80 GB, o multiples GPU consumer (por ejemplo, 2x RTX 4090 de 24 GB) para FP16.
- Cabe en GPU consumer: si, con cuantizacion agresiva (4 bits) en una unica RTX 4090 de 24 GB, aunque con margen ajustado y sin datos de rendimiento confirmados.
- Opciones de despliegue: transformers, text-generation-inference (la ficha incluye la etiqueta endpoints_compatible), y presumiblemente vLLM y llama.cpp si se generan conversiones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-MPOA-heretic | 32,76B | no disponible | apache-2.0 | gated | Variante sin rechazos; solo ingles declarado |
| Qwen/Qwen2.5-32B-Instruct | 32,76B | 32.768 tokens (nativo) | apache-2.0 | abierto | Modelo base alineado, multilingue |
| Otras variantes abliterated de Qwen2.5 | variable | variable | variable | variable | Existen multiples ajustes comunitarios similares; no se dispone de datos comparativos verificados |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas.

## Limitaciones y advertencias

- La eliminacion de los rechazos incrementa el riesgo de generar contenido danino, ilegal o sexualmente explicito; no es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, especialmente en temas sensibles, al haberse reducido los mecanismos de cautela del modelo base.
- Solo declara soporte para ingles; el rendimiento en castellano no esta documentado y puede degradarse respecto al modelo base multilingue.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su uso en pipelines automatizados sin gestion de credenciales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; el usuario asume la responsabilidad legal del contenido generado.
- No hay benchmarks publicados que permitan verificar la calidad del ajuste ni compararlo con el modelo base.
- El repositorio tiene pocas descargas (512) y cero likes, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Paper referenciado (arXiv:2611.17846): no disponible (identificador no verificable en la informacion proporcionada)

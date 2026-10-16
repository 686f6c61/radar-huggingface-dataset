# celebibasar/celebibasar-finance-32B-lora

## Resumen

celebibasar-finance-32B-lora es un adaptador LoRA de ajuste fino orientado al dominio financiero, publicado por el usuario celebibasar en HuggingFace. El adaptador se entrena sobre el modelo base unsloth/Qwen2.5-32B-Instruct-bnb-4bit, es decir, una version cuantizada a 4 bits de Qwen2.5-32B-Instruct. El nombre del repositorio sugiere especializacion en tareas de finanzas, aunque la model card no documenta el corpus de entrenamiento ni los objetivos concretos del ajuste.

Se trata por tanto de un adaptador, no de un modelo completo: el repositorio ocupa 1,1 GB en formato safetensors y necesita el modelo base para poder ejecutarse. La model card se limita a indicar el autor, la licencia Apache 2.0, el modelo de partida y que el entrenamiento se realizo con Unsloth, sin detallar hiperparametros, datos, numero de tokens ni evaluaciones.

Su relevancia actual es limitada: acumula 0 descargas y 0 likes, no tiene resultados de benchmarks publicados y la informacion disponible no permite verificar la calidad del ajuste. Debe considerarse un experimento reproducible mas que un modelo listo para produccion, especialmente en un dominio, el financiero, donde los errores factuales tienen coste alto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only de la familia Qwen2 (modelo base Qwen2.5-32B-Instruct) |
| Parametros totales | 32.500 millones en el modelo base; el numero de parametros entrenables del adaptador no esta especificado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens heredados del modelo base Qwen2.5-32B-Instruct; no confirmado en la model card del adaptador |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar. El modelo base referenciado esta en bnb-4bit. No se documentan otras cuantizaciones |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA; repo de 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-32B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA), con 64 capas, 40 cabezas de consulta y 8 cabezas de clave/valor segun la documentacion publica de Qwen2.5. Sobre ese modelo se aplica un adaptador LoRA, que anade matrices de bajo rango en determinadas proyecciones y mantiene congelados los pesos originales. El repositorio solo contiene esos pesos de adaptador, no el modelo completo.

Respecto al entrenamiento, la unica informacion disponible es que se realizo con Unsloth, que el autor describe como "2x mas rapido", y que se usaron las librerias del ecosistema TRL (etiquetas `unsloth` y `trl` del repositorio). No se especifica el dataset, el numero de tokens de entrenamiento, la composicion del corpus financiero, la longitud de secuencia, los hiperparametros del LoRA ni si hubo fases posteriores de alineamiento (DPO, RLHF o similares). Tampoco se detalla ninguna innovacion tecnica propia; el unico elemento diferencial seria el ajuste de dominio, cuyo alcance no esta documentado.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas del modelo base.
- Razonamiento y conocimiento general propios de Qwen2.5-32B-Instruct, presumiblemente reorientados al dominio financiero por el ajuste, aunque sin verificacion publicada.
- Generacion de codigo (capacidad del modelo base; no confirmada especificamente para este adaptador).
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct lo soporta mediante plantillas de chat compatibles con Hermes; no se confirma que el ajuste LoRA lo preserve.
- Capacidades de agente y razonamiento multi-paso: atribuibles al modelo base, no verificadas en el adaptador.
- Capacidades multilingues: la model card declara unicamente ingles, pese a que el modelo base es multilingue.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles ni documentadas.

## Casos de uso

- Analisis de informes financieros: extraccion y resumen de secciones de memorias anuales (10-K, 10-Q) o cuentas anuales en ingles, aprovechando la ventana de contexto larga del modelo base para procesar documentos completos en una sola pasada.
- Resumen de transcripciones de llamadas de resultados (earnings calls): condensacion de transcripciones extensas en puntos clave, guia de resultados y menciones a riesgos, con contexto suficiente para no fragmentar el documento.
- Extraccion estructurada de datos: conversion de texto financiero no estructurado (notas al pie, tablas descritas en prosa) en JSON o CSV, siempre que se valide la salida con reglas deterministicas antes de usarla.
- Asistencia a la generacion de codigo para analisis cuantitativo: prototipado de scripts de backtesting, pandas o SQL para pipelines de datos de mercado, apoyandose en las capacidades de codigo del modelo base.
- Atencion al cliente en banca o seguros (solo en ingles): respuesta a consultas frecuentes sobre productos y procesos internos, con recuperacion aumentada (RAG) sobre documentacion propia para reducir el riesgo de alucinacion.
- Revision asistida de cumplimiento normativo: clasificacion y pre-etiquetado de comunicaciones o contratos para revision humana posterior en flujos KYC/AML, entendido siempre como triaje y nunca como decision automatica.
- Generacion de borradores de comentarios de mercado: primeros borradores de notas periodisticas o internas sobre movimientos de mercado, sujetos a revision editorial y a verificacion de datos.

En todos los casos, al no existir evaluacion publicada, el modelo deberia tratarse como candidato a validar internamente antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,1 GB, pero la inferencia exige cargar el modelo base Qwen2.5-32B-Instruct.
- Modelo base en bf16/fp16: aproximadamente 65 GB de pesos, mas cache KV; requiere una GPU de 80 GB (H100, A100 80 GB) o varias GPU en paralelo por tensor.
- Modelo base en 8 bits: en torno a 34 GB, viable en A100 40 GB o en 2x RTX 4090 con reparto de capas.
- Modelo base en 4 bits (bnb, AWQ o GPTQ): en torno a 18-20 GB, lo que permite ejecucion en una RTX 4090 o RTX 3090 de 24 GB, con contexto limitado para que quepa la cache KV.
- Consumer GPU: si, con cuantizacion de 4 bits en GPU de 24 GB. En GPU de 16 GB o menos no cabe el modelo completo sin offloading a RAM, que degrada gravemente la latencia.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sobre el base; vLLM con soporte de LoRA; TGI (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponible.
- Nota de entrenamiento: entrenar o reajustar este adaptador requiere QLoRA o LoRA sobre el base cuantizado, con requisitos de VRAM muy inferiores a los del ajuste completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| celebibasar-finance-32B-lora | LoRA sobre 32.500 M | 131.072 tokens (heredado del base) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen2.5-32B-Instruct (modelo base de referencia) | 32.500 M | 131.072 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Qwen2.5-14B-Instruct | 14.700 M | No disponible en la informacion consultada | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8.000 M | No disponible en la informacion consultada | Llama 3.1 Community License | HuggingFace |

No hay datos de rendimiento comparativo entre estos modelos en la informacion disponible, por lo que la tabla solo recoge caracteristicas estructurales y de licencia. En la practica, la comparacion relevante es contra el propio modelo base sin ajustar: hasta que no exista una evaluacion en tareas financieras, no puede afirmarse que el LoRA aporte mejoras.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de uso en la model card.
- Adopcion nula: 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Riesgo de alucinacion elevado en dominio financiero: el modelo puede inventar cifras, fechas o referencias normativas con apariencia plausible. Cualquier salida debe verificarse contra la fuente original.
- No es asesoramiento financiero: no debe utilizarse para tomar decisiones de inversion ni para emitir recomendaciones a clientes sin supervision humana cualificada.
- Idioma: la model card declara solo ingles, pese a que el modelo base es multilingue. El comportamiento en castellano es desconocido y no esta garantizado.
- Procedencia de los datos de ajuste desconocida: no se documenta el corpus, por lo que no puede evaluarse el sesgo ni la posible inclusion de datos con derechos de terceros.
- El repositorio contiene unicamente el adaptador: no es ejecutable por si solo y requiere descargar el modelo base, lo que anula el ahorro de espacio.
- El modelo base indicado esta cuantizado a 4 bits (bnb-4bit), lo que puede degradar ligeramente la calidad respecto a un base en bf16 antes del ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base subyacente y de los datos de ajuste no documentados.
- Anomalia en los metadatos: la fecha de creacion indicada es el 15 de octubre de 2026, posterior a la fecha actual, lo que sugiere metadatos inconsistentes o generados automaticamente.
- Sin garantias de mantenimiento: el autor no documenta versiones, changelog ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/celebibasar/celebibasar-finance-32B-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-32B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Qwen2.5: no disponible en la informacion proporcionada
- Paper o blog del ajuste: no disponible en la informacion proporcionada

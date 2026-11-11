# mradermacher/LFM3-1.7B-Heretic-NX-i1-GGUF

## Resumen

LFM3-1.7B-Heretic-NX-i1-GGUF es una redistribucion en formato GGUF de los pesos del modelo LFM3-1.7B-Heretic-NX, publicada por el usuario mradermacher en Hugging Face. Se trata de una cuantizacion de un modelo de la familia LFM3 (presumiblemente Liquid Foundation Model 3) de 1.700 millones de parametros nominales, derivado a su vez del modelo base 0xzknw/LFM3-1.7B-Heretic-NX. El repositorio contiene unicamente los ficheros cuantizados, no los pesos originales en precision completa.

El interes de esta publicacion es practico: ofrece el modelo en multiples niveles de cuantizacion GGUF (desde IQ1_S hasta Q6_K), lo que permite ejecutarlo en hardware de consumo con distintos compromisos entre calidad y uso de memoria. La model card es extremadamente escasa: solo documenta metadatos del proceso de cuantizacion (version 2, conversion desde formato HF, uso de imatrix y pesos ponderados) y la lista de cuantizaciones generadas. No se aporta informacion sobre arquitectura, datos de entrenamiento, licencia ni idiomas.

La relevancia es limitada y muy especifica: sirve a usuarios que ya conocen el modelo original y quieren una version lista para llama.cpp u Ollama. Dado que el repositorio no incluye model card tecnica, benchmarks ni licencia explicita, cualquier evaluacion rigurosa debe remitirse al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3; detalles no documentados en la model card) |
| Parametros totales | 1,7 B (nominal, segun nombre del modelo); el campo de parametros del repo indica 899.013, dato no coherente con el nombre y probablemente erroneo |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado; pesos originales en safetensors en el repo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El nombre sugiere pertenencia a la familia LFM3, pero la model card no detalla si se trata de un transformer clasico, una arquitectura hibrida o un modelo con capas de atencion lineal. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similar.

Lo unico documentado es el proceso de cuantizacion: se empleo la version 2 del pipeline de cuantizacion de mradermacher, con conversion desde formato Hugging Face, cuantizacion de tensores de salida y generacion de cuantizaciones ponderadas con imatrix (weighted/imatrix quants). El sufijo "Heretic" en el nombre del modelo base sugiere un ajuste fino de tipo abliteration o "uncensoring", practica habitual en la comunidad para reducir rechazos del modelo, pero no hay confirmacion tecnica en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva: capacidad basica esperada de cualquier modelo de la familia, aunque no se documenta explicitamente en la model card.
- Razonamiento y conversacion multi-turno: no confirmado en la documentacion disponible.
- Generacion de codigo y matematicas: no confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.
- Ejecucion local en CPU/GPU via llama.cpp: capacidad derivada del formato GGUF, no del modelo en si.

## Casos de uso

- Despliegue local en equipos de sobremesa: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 1,7 B en GPUs de consumo con 4-6 GB de VRAM o incluso en CPU, usando llama.cpp u Ollama.
- Prototipado rapido de aplicaciones de chat: al ser un modelo pequeno y cuantizado, sirve para validar pipelines de inferencia antes de escalar a modelos mayores.
- Experimentacion con modelos "uncensored" o con rechazos reducidos: el sufijo Heretic del modelo base apunta a este uso, aunque no hay documentacion que lo confirme; util para investigacion sobre comportamiento de rechazo.
- Inferencia en dispositivos con recursos limitados: las variantes IQ2 e IQ3 permiten ejecucion en entornos con menos de 3 GB de memoria, a costa de perdida de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece casi toda la escala de cuantizaciones, lo que facilita estudios de degradacion calidad/memoria sobre un mismo modelo.
- Integracion en herramientas de escritorio con llama.cpp: al estar en GGUF, se puede cargar directamente en frontends como LM Studio, Jan o koboldcpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, para 1,7 B parametros):
  - IQ1_S / IQ1_M: en torno a 0,5-0,8 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K: en torno a 0,8-1,3 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 1,2-1,8 GB.
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 1,5-2,2 GB.
  - Q5_K_S / Q5_K_M: en torno a 2,0-2,6 GB.
  - Q6_K: en torno a 2,4-3,0 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para las cuantizaciones Q4 y superiores; GPUs de datacenter (A100, H100) no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, y en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, Jan y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-NX-i1-GGUF | 1,7 B (nominal) | no disponible | no disponible | GGUF | Hugging Face |
| Modelo base 0xzknw/LFM3-1.7B-Heretic-NX | 1,7 B (nominal) | no disponible | no disponible | safetensors | Hugging Face |
| Otros modelos de ~1-2 B en GGUF (p. ej. Qwen2.5-1.5B-Instruct-GGUF) | 1,5 B | 32k (tipico) | Apache 2.0 (tipico) | GGUF | Hugging Face |

La comparativa con alternativas de la misma categoria no puede completarse con rigor porque no se dispone de datos de rendimiento, contexto ni licencia del modelo evaluado. Cualquier comparacion cuantitativa seria especulativa.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre arquitectura, entrenamiento, sesgos ni evaluaciones.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible consultar la licencia del modelo base 0xzknw/LFM3-1.7B-Heretic-NX antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones que lo cuantifiquen.
- Perdida de calidad por cuantizacion: las variantes IQ1 e IQ2 degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior.
- Discrepancia en el numero de parametros: el campo del repositorio indica 899.013, incoherente con el nombre de 1,7 B; conviene verificar el modelo base.
- El sufijo "Heretic" sugiere un ajuste para reducir rechazos, lo que puede implicar menor alineacion de seguridad; no confirmado por el autor.
- Idiomas soportados desconocidos: no se puede asumir un buen rendimiento en castellano sin pruebas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad ni validacion externa.
- Fecha de creacion futura (2026-11-11) en los metadatos: posible error de la plataforma o del autor; tratar con cautela.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-NX-i1-GGUF
- Modelo base: https://huggingface.co/0xzknw/LFM3-1.7B-Heretic-NX
- Perfil del autor: https://huggingface.co/mradermacher

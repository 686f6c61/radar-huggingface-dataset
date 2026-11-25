# GhaythMahadin/Qwen3.6-35B-A3B-GGUF

## Resumen
Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Alibaba Qwen, distribuido en este repositorio como una cuantizacion GGUF Q4_K_M realizada por el usuario GhaythMahadin a partir de los pesos publicados por Unsloth. El modelo cuenta con 34.660.610.688 parametros totales y activa aproximadamente 3.000 millones por token (el sufijo A3B indica 3B activos), lo que permite un equilibrio entre capacidad y coste de inferencia. Esta ficha describe especificamente el artefacto GGUF alojado en este repositorio, no los pesos originales en safetensors.

El repositorio tiene como proposito servir de copia de respaldo para un motor local gratuito denominado «marsad» (مرصد التحقق), segun indica la propia model card. El unico fichero documentado es `Qwen3.6-35B-A3B-UD-Q4_K_M.gguf`, con un hash SHA-256 publicado para verificacion de integridad. El tamano total del repositorio es de 22,1 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de ~35B parametros totales en hardware de consumo mediante cuantizacion Q4_K_M, manteniendo la licencia Apache-2.0 del modelo base. No obstante, la informacion publicada en el repositorio es muy escasa y muchos datos tecnicos (idiomas, contexto, benchmarks) no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun el sufijo A3B; detalles no disponibles |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3B (inferido del sufijo A3B; no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero documentado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La informacion disponible indica que el modelo es de tipo Mixture of Experts, con 34.660.610.688 parametros totales y un sufijo A3B que sugiere aproximadamente 3.000 millones de parametros activos por token. No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, la estrategia de enrutamiento, el numero de capas, la dimension oculta ni la longitud de contexto nativa. El modelo base es `unsloth/Qwen3.6-35B-A3B-GGUF`, que a su vez procede de la familia Qwen3.6 de Alibaba.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o post-entrenamiento especifico. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, thinking mode, etc.). El artefacto de este repositorio es una cuantizacion Q4_K_M generada con llama.cpp, presumiblemente con una matriz de importancia (tag `imatrix`), aunque no se detalla el proceso de cuantizacion.

## Capacidades
- Generacion de texto conversacional: el tag `conversational` sugiere uso en dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades esperables en la familia Qwen3.6, aunque no confirmadas en la informacion disponible.
- Ejecucion local mediante llama.cpp: el formato GGUF permite inferencia en CPU y GPU sin dependencias de frameworks propietarios.
- Verificacion de integridad: el repositorio publica el SHA-256 del fichero GGUF.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso
- Motor local de respaldo para el sistema «marsad»: la model card indica explicitamente que esta copia se usa como motor local gratuito de «مرصد التحقق»; el modelo se cargaria con llama.cpp para mantener el servicio operativo sin dependencia de APIs externas.
- Inferencia en estaciones de trabajo sin GPU de datacenter: al ser una cuantizacion Q4_K_M de un MoE con ~3B activos, puede ejecutarse en equipos con 16-24 GB de VRAM o incluso en CPU con RAM suficiente, lo que lo hace adecuado para entornos de desarrollo individuales.
- Prototipado de aplicaciones conversacionales: el tag `conversational` y la licencia Apache-2.0 permiten integrar el modelo en demos y pruebas de concepto sin restricciones de uso comercial.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse localmente, evita el envio de informacion sensible a servicios en la nube, util para sectores regulados.
- Reproducibilidad y auditoria: el hash SHA-256 publicado permite verificar que el fichero descargado es identico al original, util en pipelines de validacion de artefactos.
- Fine-tuning o experimentacion sobre GGUF: aunque el formato GGUF no es el ideal para entrenamiento, puede servir como base para evaluaciones comparativas de cuantizaciones o para tareas de generacion con restricciones de hardware.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el fichero Q4_K_M ocupa parte de los 22,1 GB del repositorio; se estima un uso de VRAM en torno a 20-22 GB para cargar el modelo completo en GPU, aunque el dato exacto no esta disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar viabilidad en A100 40GB, H100 y RTX 4090 24GB, pero no esta confirmado.
- GPU de consumo: probablemente ejecutable en RTX 3090/4090 (24 GB) con Q4_K_M; en GPUs de 16 GB requeriria offloading parcial a CPU, extremo no confirmado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este repo, GGUF Q4_K_M) | 34,66B | ~3B (inferido) | no disponible | Apache-2.0 | GGUF |
| unsloth/Qwen3.6-35B-A3B-GGUF (base) | 34,66B | ~3B (inferido) | no disponible | Apache-2.0 | GGUF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de modelos comparables verificables; la comparativa se limita al modelo base del que deriva esta cuantizacion.

## Limitaciones y advertencias
- Informacion tecnica incompleta: la model card no documenta contexto, idiomas, arquitectura detallada ni benchmarks, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta cuantizacion.
- Perdida por cuantizacion: Q4_K_M introduce degradacion respecto a los pesos originales en safetensors; no se han publicado mediciones de esa perdida.
- Sesgos: no documentados en la informacion disponible.
- Idioma: la model card esta redactada en arabe y no se especifican los idiomas soportados; el rendimiento en castellano no esta verificado.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original de Qwen y de la cuantizacion de Unsloth.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantia de mantenimiento ni soporte.
- Fecha de creacion futura (2026-11-25): conviene verificar la autenticidad y procedencia del artefacto antes de usarlo en entornos criticos.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/Qwen3.6-35B-A3B-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- llama.cpp (formato GGUF): https://github.com/ggerganov/llama.cpp
- Familia Qwen (Alibaba): https://huggingface.co/Qwen

# Cadenza-Labs/c-esg

## Resumen

Cadenza-Labs/c-esg es un modelo publicado en Hugging Face por el laboratorio Cadenza-Labs bajo licencia Apache 2.0 y acceso restringido (gated). El repositorio, de 3,4 GB, contiene pesos en formato safetensors y fue creado en octubre de 2026, con una actualización posterior en noviembre del mismo ano. El nombre del modelo sugiere un enfoque hacia criterios ESG (ambientales, sociales y de gobernanza), aunque la informacion publica disponible no confirma esta orientacion ni detalla el proposito declarado del modelo.

La ficha tecnica de Hugging Face no incluye pipeline declarado, idiomas soportados ni documentacion sobre arquitectura, entrenamiento o capacidades. El tamano del repositorio (3,4 GB) es compatible con un modelo de parametros medios en precision completa o con un modelo mayor cuantizado, pero sin datos de configuracion no es posible determinarlo con rigor. El acceso restringido implica que cualquier evaluacion practica requiere solicitar permiso al autor y aceptar las condiciones de uso en la plataforma.

Dada la ausencia de informacion tecnica verificable, esta ficha recoge unicamente los datos confirmados en la model card y senala explicitamente como "no disponible" todo aquello que no ha sido publicado. Se recomienda precaucion antes de considerar el modelo para entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens utilizados ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La model card de Hugging Face no incluye documentacion tecnica asociada ni referencias a papers o repositorios de entrenamiento.

El unico dato estructural disponible es el tamano del repositorio (3,4 GB) y el formato de pesos (safetensors). No se ha publicado informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal, ventanas de contexto extendidas o modos de razonamiento explicito.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision o multimodalidad: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Cualquier capacidad especial (audio, video, etc.): no disponible.

## Casos de uso

Dado que no se han publicado especificaciones tecnicas, no es posible recomendar casos de uso concretos con garantias. Los siguientes escenarios son hipoteticos y requeririan validacion previa con el modelo real:

- Clasificacion de documentos ESG: si el modelo esta especializado en criterios ambientales, sociales y de gobernanza, podria emplearse para etiquetar informes corporativos, aunque no hay evidencia publica de ello.
- Analisis de informes de sostenibilidad: requeriria contexto largo y capacidad de razonamiento sobre texto financiero, ambos no confirmados.
- Extraccion de entidades en textos regulatorios: dependeria de soporte multilingue y de tool calling, no documentados.
- Generacion de resumenes ejecutivos: solo viable si el modelo demuestra calidad en generacion de texto, no verificada.
- Asistencia en due diligence: precisaria trazabilidad y baja alucinacion, sin datos publicos que lo respalden.
- Integracion en pipelines de compliance: exigiria documentacion de sesgos, licencia y limites de contexto, actualmente ausentes.

En todos los casos, el acceso restringido obliga a solicitar permiso al autor antes de cualquier prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (3,4 GB) sugiere que la inferencia en precision completa podria caber en GPUs consumer con 8-12 GB de VRAM, pero esta estimacion es especulativa y no esta confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: no disponible (no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa sin conocer la arquitectura, el tamano de parametros, el contexto y el rendimiento del modelo. Se indica "no disponible" para todos los criterios comparativos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cadenza-Labs/c-esg | no disponible | no disponible | Apache 2.0 | Gated en Hugging Face |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 3 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card extendida, paper, blog ni repositorio de codigo asociado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face y aprobacion del autor, lo que limita la reproducibilidad y la evaluacion independiente.
- Sin datos de benchmarks: no es posible verificar calidad, sesgos ni robustez frente a modelos establecidos.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas, lo que impide recomendarlo para produccion multilingue.
- Riesgo de alucinacion: no evaluado por terceros.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el acceso gated puede imponer condiciones adicionales definidas por el autor que deben revisarse antes de su uso en produccion.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Fecha de creacion reciente (octubre de 2026): posible inmadurez del proyecto y cambios frecuentes en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Cadenza-Labs/c-esg
- Paper: no disponible
- Blog o documentacion: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible

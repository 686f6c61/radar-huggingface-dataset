# OpenIntelligenceNet/Spark-X-2.5-Cyber-GGUF

## Resumen

Spark-X-2.5-Cyber-GGUF es la distribucion cuantizada en formato GGUF del modelo Spark-X-2.5-Cyber, desarrollado por OpenIntelligenceNet. Se trata de un modelo de lenguaje de 4.112.079.360 parametros (aproximadamente 4,1 mil millones) afinado especificamente para tareas de ciberseguridad: mecanicas de ataque y deteccion en Active Directory, pruebas de aplicaciones web con su remediacion correspondiente, y metodologia OSINT. El modelo base esta pensado para evaluaciones de seguridad autorizadas, formacion, laboratorios y practicas CTF.

La relevancia de esta publicacion esta en el empaquetado: el repositorio incluye cinco variantes de cuantizacion (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y F16) generadas a partir del GGUF F16 original mediante `llama-quantize`, lo que permite ejecutar el modelo en hardware muy modesto, desde telefonos con menos de 6 GB de RAM hasta equipos de escritorio sin GPU dedicada. La plantilla de chat va embebida en el propio archivo GGUF, de modo que los runtimes compatibles la detectan automaticamente.

El modelo es conversacional, esta etiquetado como compatible con endpoints y solo declara soporte de ingles. Su licencia Apache 2.0 facilita el uso comercial y la modificacion, aunque el propio autor advierte de que el modelo puede equivocarse con seguridad y de que toda tecnica o comando debe verificarse contra documentacion oficial antes de usarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo conversacional; la model card no detalla la arquitectura interna) |
| Parametros totales | 4.112.079.360 (aproximadamente 4,1 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 4096` y `n_ctx=4096`, pero no se declara un maximo oficial) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo base Spark-X-2.5-Cyber: no se especifica si es un transformer denso, un MoE ni variantes hibridas, ni se detalla la composicion del dataset de entrenamiento, el numero de tokens vistos o si se aplicaron fases de RLHF o DPO. Lo unico documentado es el proceso de conversion y cuantizacion: los pesos originales en safetensors se convirtieron a GGUF F16 con `convert_hf_to_gguf.py` de llama.cpp y despues se generaron las variantes cuantizadas con `llama-quantize`, todas derivadas del F16.

El ajuste declarado del modelo esta orientado a dominios de seguridad: preguntas de evaluacion, walkthroughs de ataque y deteccion en Active Directory, testing de aplicaciones web y su remediacion, y metodologia OSINT. La model card incluye ajustes de muestreo recomendados (temperature 0,7, top_p 0,9, top_k 40, repeat_penalty 1,1) y sugiere subir el repeat_penalty a 1,2-1,3 si aparecen repeticiones, lo que indica que el autor ha observado ese comportamiento en pruebas.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con plantilla de chat embebida en el GGUF.
- Conocimiento especializado en ciberseguridad: mecanicas de ataque y deteccion en Active Directory (el ejemplo de la model card es Kerberoasting y su deteccion defensiva), testing de aplicaciones web y remediacion, y metodologia OSINT.
- Redaccion de documentacion de seguridad e informes tecnicos.
- Soporte de practicas CTF y laboratorios de formacion.
- Compatibilidad con endpoints OpenAI a traves de `llama-server`.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documentan de forma explicita).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Formacion en ciberseguridad y laboratorios: el modelo responde preguntas sobre tecnicas concretas (por ejemplo, Kerberoasting) y explica tanto el ataque como la deteccion defensiva, lo que lo hace util como tutor en entornos de aprendizaje controlados.
- Practicas CTF: puede ayudar a razonar sobre retos de seguridad y metodologias de resolucion, con la ventaja de ejecutarse localmente en un portatil con la cuantizacion Q4_K_M (2,60 GB).
- Preparacion de red team autorizado: sirve como apoyo para repasar tecnicas y checklists antes de un engagement, siempre con verificacion manual de cada comando y version.
- Redaccion de informes de seguridad: genera borradores de documentacion y hallazgos a partir de notas del analista, aprovechando su ajuste al dominio y su licencia Apache 2.0 para uso comercial.
- Investigacion defensiva: permite entender un ataque concreto para disenar reglas de deteccion y mitigaciones, un uso que el propio autor contempla en la seccion de uso previsto.
- Despliegue en entornos con hardware limitado: al caber en 2,60 GB (Q4_K_M) y ejecutarse con llama.cpp u Ollama, es viable en telefonos, portatiles sin GPU y dispositivos de borde donde no se quiere enviar consultas de seguridad a servicios en la nube.
- API local compatible con OpenAI: con `llama-server` se puede integrar en herramientas internas o pipelines que ya hablan el formato de la API de OpenAI, sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de ciberseguridad, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamanos de archivo declarados en la model card):
  - Q4_K_M: 2,60 GB, recomendado para telefonos y dispositivos con poca RAM (menos de 6 GB).
  - Q5_K_M: 2,98 GB, para portatiles o equipos de escritorio con CPU.
  - Q6_K: 3,38 GB, calidad muy cercana al original.
  - Q8_0: 4,38 GB, practicamente sin perdida; es el que mas RAM necesita entre los cuantizados.
  - F16: 8,23 GB, precision completa de referencia.
- GPU recomendadas: no disponible (la model card no menciona GPU concretas; el enfoque es inferencia local en CPU y dispositivos de baja memoria).
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU con 8 GB o mas de VRAM usando Q4_K_M a Q8_0; el F16 requiere alrededor de 8,23 GB solo para pesos, mas overhead de contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI), Ollama (`ollama run hf.co/...`), llama-cpp-python. Otros runtimes GGUF no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible (no se publican cifras).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos pequenos especializados en ciberseguridad en formato GGUF) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo puede equivocarse con seguridad: hay que verificar cada comando, numero de version y tecnica contra documentacion oficial antes de confiar en la respuesta.
- La cuantizacion degrada ligeramente la calidad, de forma mas notable en Q4_K_M; si las respuestas parecen incorrectas, se recomienda usar un archivo mayor (Q6_K, Q8_0 o F16).
- Es un modelo pequeno (aproximadamente 4,1 mil millones de parametros), por lo que puede perder contexto en escenarios largos o complejos.
- Solo declara soporte de ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion en detalles tecnicos (versiones, rutas, flags de herramientas) inherente a un modelo de este tamano; no se documentan sesgos especificos.
- Uso responsable: solo debe emplearse en sistemas propios o con permiso escrito explicito; el autor declina responsabilidad por mal uso y no ofrece asesoramiento legal.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las obligaciones de atribucion y las condiciones del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OpenIntelligenceNet/Spark-X-2.5-Cyber-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/Spark-X-2.5-Cyber
- Organizacion: https://huggingface.co/OpenIntelligenceNet
- Archivo Q4_K_M: https://huggingface.co/OpenIntelligenceNet/Spark-X-2.5-Cyber-GGUF/resolve/main/Spark-X-2.5-Cyber-Q4_K_M.gguf
- Archivo Q5_K_M: https://huggingface.co/OpenIntelligenceNet/Spark-X-2.5-Cyber-GGUF/resolve/main/Spark-X-2.5-Cyber-Q5_K_M.gguf
- Archivo Q6_K: https://huggingface.co/OpenIntelligenceNet/Spark-X-2.5-Cyber-GGUF/resolve/main/Spark-X-2.5-Cyber-Q6_K.gguf
- Archivo Q8_0: https://huggingface.co/OpenIntelligenceNet/Spark-X-2.5-Cyber-GGUF/resolve/main/Spark-X-2.5-Cyber-Q8_0.gguf
- Archivo F16: https://huggingface.co/OpenIntelligenceNet/Spark-X-2.5-Cyber-GGUF/resolve/main/Spark-X-2.5-Cyber-F16.gguf

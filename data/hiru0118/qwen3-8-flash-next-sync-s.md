# hiru0118/Qwen3.8-Flash-Next-Sync-S

## Resumen

Qwen3.8-Flash-Next Sync-S es un *expert pack* experimental publicado por el usuario hiru0118 para el modelo base Qwen/Qwen3.8-Flash-Next del equipo Qwen. No se trata de un modelo nuevo ni de un ajuste fino: es una re-cuantizacion de los expertos enrutados (MoE) del modelo original a un formato trellis denominado R1Q2, de la familia Gyro/QTIP, con una asignacion de bits por experto que promedia unos 1,7 bits por peso. El objetivo es claro: hacer que un modelo MoE de gran tamano pueda ejecutarse en una unica GPU de consumo con 32 GB de RAM de sistema, en concreto una RTX 3080 de 12 GB con 32 GB de DDR5, que es el entorno en el que se desarrollo.

El pack no es autonomo. Los expertos re-cuantizados ocupan 24,07 GiB y el resto de pesos (capas densas, embeddings y PLE) se leen desde el GGUF Gyro-S de agentionai, que el usuario debe descargar por separado. La ejecucion requiere sync-strata, un fork del motor Strata de Niko1221. El autor advierte explicitamente de que no es un GGUF y de que no carga ni en llama.cpp ni en Strata upstream, lo que limita mucho su alcance practico.

La relevancia de esta publicacion es fundamentalmente metodologica: demuestra una via para comprimir de forma agresiva los expertos de un MoE manteniendo una divergencia KL razonablemente baja respecto al original (segun el autor, un 34 % menor que Gyro-S en su evaluacion de 8 dominios). No obstante, se trata de un lanzamiento de prueba para unos pocos testers, sin resultados de benchmarks publicos, sin datos de idiomas declarados y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) heredada de Qwen3.8-Flash-Next; el pack contiene solo los expertos enrutados re-cuantizados |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis R1Q2 (familia Gyro/QTIP), ~1,7 bits por peso de media con asignacion por experto; resto de pesos en GGUF Gyro-S |
| Idiomas soportados | no disponible (la calibracion uso texto multilingue, pero no se declara cobertura oficial) |
| Licencia | Qwen Community License 1.0 (pesos); MIT (binario del motor en `kit/engine`) |
| Formato de pesos | Trellis R1Q2 para expertos + GGUF Gyro-S para capas densas, embeddings y PLE; no compatible con llama.cpp |
| Tamano del repositorio | 27,5 GB |
| Tamano de los expertos | 24,07 GiB |
| Motor de inferencia | sync-strata (fork de Strata), requiere Strata v0.2.1.1 instalado con Gyro-S |
| Hardware de referencia | RTX 3080 12 GB + 32 GB DDR5, Windows, driver CUDA 13 (R580 o superior) |

## Arquitectura y entrenamiento

El pack no incluye entrenamiento en el sentido habitual. Lo que hace es tomar los expertos enrutados de Qwen3.8-Flash-Next y re-cuantizarlos a un formato trellis R1Q2, en la linea de Gyro y QTIP (Tseng et al., 2024). La innovacion esta en la asignacion de bits por experto: en lugar de aplicar una tasa uniforme, se distribuye el presupuesto de bits de forma desigual entre expertos, lo que permite una media de aproximadamente 1,7 bits por peso con un impacto controlado en la calidad. Las capas densas, los embeddings y los PLE quedan fuera del pack y se leen en formato GGUF Gyro-S desde el repositorio de agentionai, en la revision `1ada08422e404aca51ab9df665f089f34c419c6b`.

La calibracion se realizo con texto publico (codigo, documentacion, Wikipedia, varios idiomas y trazas de agentes) junto con algunos registros de chat del propio autor. El texto de calibracion no se distribuye, lo que impide reproducir el proceso. El autor reporta que la divergencia KL respecto al modelo original en su evaluacion de 8 dominios es aproximadamente un 34 % inferior a la de Gyro-S, pero no publica la metodologia ni las cifras completas en esta version de prueba. El motor sync-strata, fork de Strata bajo licencia MIT, es el unico capaz de cargar el formato; no hay soporte en llama.cpp ni en Strata upstream.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-Flash-Next en la medida en que la re-cuantizacion las preserve; no hay evaluacion publica que lo cuantifique.
- Codigo y matematicas: el modelo base es de proposito general, pero el pack no documenta resultados especificos en estas areas.
- Tool calling y function calling: presumiblemente soportado por herencia del modelo base; no verificado en esta release.
- Razonamiento multi-paso y uso como agente: la calibracion incluyo trazas de agentes, lo que sugiere que el autor priorizo este caso de uso, aunque no se aportan metricas.
- Multilingue: la calibracion uso texto en varios idiomas, pero no se declara una lista oficial de idiomas soportados.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con cuantizacion trellis en MoE: el pack sirve como banco de pruebas para investigadores interesados en asignacion no uniforme de bits por experto y en formatos de la familia QTIP. Su valor esta en poder reproducir el pipeline sobre hardware de consumo.
- Inferencia local de un MoE grande en una sola GPU: el escenario objetivo es una RTX 3080 de 12 GB con 32 GB de RAM, donde el desbordamiento a memoria del sistema permite mantener el modelo en ejecucion con latencias probablemente altas pero funcionales para pruebas interactivas.
- Evaluacion comparativa de metodos de compresion: al estar construido sobre Gyro-S, permite medir de forma directa la divergencia KL y la calidad percibida frente a esa linea base en el mismo entorno.
- Prototipado de agentes con trazas: dado que la calibracion incluyo trazas de agentes, es un candidato razonable para experimentar con flujos multi-paso antes de invertir en infraestructura mayor.
- Docencia y divulgacion: util para explicar en un articulo o taller como se estructura un expert pack, como se combinan pesos trellis con GGUF y por que el formato no es portable a llama.cpp.
- Validacion de motores alternativos: sirve para probar sync-strata y comparar su comportamiento con Strata upstream, aunque no sustituye a este ultimo para cargar el pack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de calidad es la afirmacion del autor de que la divergencia KL respecto al modelo original en su evaluacion de 8 dominios es aproximadamente un 34 % menor que la de Gyro-S, sin cifras absolutas ni detalle metodologico.

## Requisitos de hardware

- VRAM estimada: 12 GB en la GPU de referencia (RTX 3080), con el resto del modelo residiendo en RAM del sistema.
- RAM del sistema: 32 GB DDR5 en el entorno de desarrollo; no se documenta un minimo oficial.
- GPU recomendadas: RTX 3080 12 GB es la unica configuracion validada por el autor. No hay datos para A100, H100, RTX 4090 ni otras GPU.
- Cabe en GPU de consumo: si, al menos en la RTX 3080 12 GB documentada, con apoyo de RAM.
- Opciones de despliegue: exclusivamente sync-strata (fork de Strata) sobre Strata v0.2.1.1 con Gyro-S instalado. No funciona en llama.cpp, Ollama, vLLM ni TGI.
- Requisitos de software: Windows, driver NVIDIA para CUDA 13 (R580 o superior), kit de prueba `kit/sync_s_test.py` con instrucciones en `kit/README-ja.md` (en japones).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next Sync-S (este pack) | no disponible (expertos a ~1,7 bits, 24,07 GiB) | no disponible | Trellis R1Q2 + GGUF Gyro-S | Qwen Community License 1.0 | Experimental, test release, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | safetensors (presumible) | Qwen Community License 1.0 | Publico en HuggingFace |
| agentionai/Qwen3.8-Flash-Next-Gyro-GGUF (Gyro-S) | no disponible | no disponible | GGUF | no disponible en la informacion | Publico en HuggingFace |

La comparativa se limita a las tres variantes documentadas en la informacion disponible. No se dispone de datos de parametros, contexto ni rendimiento para establecer una comparacion cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Estado experimental: es una test release para unos pocos testers, con "rough edges" reconocidos por el autor. No apta para produccion.
- Portabilidad nula: no carga en llama.cpp ni en Strata upstream; requiere el fork sync-strata y una version concreta de Strata (v0.2.1.1).
- Dependencia de un segundo repositorio: el pack no es autonomo; necesita el GGUF Gyro-S de agentionai en una revision concreta, lo que anade un punto de fallo externo.
- Calibracion no reproducible: el texto de calibracion no se distribuye, por lo que no se puede auditar ni replicar el proceso.
- Sin benchmarks publicos: la unica metrica de calidad es una afirmacion cualitativa sobre divergencia KL sin cifras absolutas.
- Riesgo de alucinacion: no evaluado en esta release; la re-cuantizacion agresiva a ~1,7 bits por peso puede degradar la fidelidad de forma no uniforme entre dominios.
- Idiomas: no se declara cobertura oficial; el uso de texto multilingue en calibracion no garantiza un rendimiento equilibrado.
- Licencia: los pesos derivan de Qwen3.8-Flash-Next y quedan bajo Qwen Community License 1.0, con las restricciones que esa licencia imponga para uso comercial. El binario del motor en `kit/engine` es MIT.
- Hardware acotado: solo validado en RTX 3080 12 GB con 32 GB DDR5 y Windows; no hay garantias en otras configuraciones.
- Madurez del ecosistema: el formato trellis R1Q2 y el motor sync-strata tienen soporte muy limitado fuera del circulo del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hiru0118/Qwen3.8-Flash-Next-S
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF Gyro-S de agentionai: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Especificacion y codigo de referencia del formato Gyro: https://gitlab.com/agentionai-group/agention-gyro
- Strata (motor original): https://github.com/Niko1221/Strata
- llama.cpp / ggml: https://github.com/ggml-org/llama.cpp
- Apoyo al autor de Gyro (agentionai): https://buymeacoffee.com/agentionai
- Paper de QTIP (Tseng et al., 2024): no disponible como enlace directo en la informacion proporcionada.

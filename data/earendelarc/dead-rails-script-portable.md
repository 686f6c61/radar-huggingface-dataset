# EarendelArc/dead-rails-script-portable

## Resumen

No disponible. El identificador `EarendelArc/dead-rails-script-portable` no corresponde a un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un supuesto ejecutable portable para Windows de 64 bits (`lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB), distribuido con contraseña de descompresión y presentado como un script para el videojuego "Dead Rails". No existe información sobre arquitectura de red neuronal, parámetros, tokenizador, pesos ni proceso de entrenamiento.

La model card del autor describe módulos de automatización (bucles de farmeo, alertas por webhook de Discord, guardia anti-AFK, salto entre servidores, optimizador de framerate y configuración JSON persistente), es decir, funcionalidad propia de una herramienta de automatización de cliente de juego, no de un modelo generativo. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman esta naturaleza.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA. Los apartados siguientes reflejan la ausencia de datos técnicos verificables y advierten de los riesgos de seguridad asociados a la distribución de binarios opacos con contraseña desde enlaces de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no aplicable a un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.exe` dentro de un `.zip`) |

## Arquitectura y entrenamiento

No disponible. No se ha publicado información sobre arquitectura de red, dataset, número de tokens, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. El artefacto descrito en la model card es un ejecutable nativo de Windows con módulos de automatización, sin relación con transformers, MoE, SSM ni arquitecturas híbridas.

La model card menciona parámetros de ejecución como frecuencia de sondeo (`331 Hz`, `267 Hz`), uso de memoria (`< 58 MB` de RAM) y `15` hilos de trabajo, pero estos datos describen el comportamiento del binario, no de un modelo entrenado.

## Capacidades

- No disponible como modelo de IA.
- El artefacto se presenta como herramienta de automatización para el juego "Dead Rails": bucle de farmeo, alertas por webhook, guardia anti-AFK, cambio de servidor y optimización de framerate.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documenta capacidad multilingüe real; los códigos de idioma del repositorio son metadatos de clasificación, no una declaración de competencia lingüística del artefacto.

## Casos de uso

- No disponible. No se identifican casos de uso legítimos como modelo de IA.
- Automatización de tareas dentro de un videojuego: el binario declararía funciones de farmeo y anti-AFK, pero su uso probablemente infringe los términos de servicio del juego y no está verificado.
- Distribución de software portable en Windows: el paquete se presenta como ejecutable sin dependencias externas, aunque la procedencia y el contenido del binario no son auditables.
- Integración en pipelines de desarrollo: no aplicable; no expone API, SDK ni interfaz de inferencia.
- Generación de código o texto: no aplicable; no hay modelo subyacente.
- Análisis de datos o razonamiento: no aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos numéricos de la model card (descargas `748K+`, valoración `99%`, tamaño `4,8 MB`, build `4B159A`) son métricas de marketing del propio repositorio y no verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Requisitos declarados del binario: Windows de 64 bits; uso de RAM inferior a `58 MB` según la model card; sin dependencias externas declaradas.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles; los valores de sondeo (`331 Hz`, `267 Hz`) no son métricas de inferencia de un modelo.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el artefacto no es un modelo de lenguaje ni multimodal. Cualquier comparación con modelos como Llama, Mistral o Qwen sería engañosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de categoría.
- Distribución de un ejecutable opaco protegido con contraseña (`2026`) y alojado en enlaces de GitHub de terceros: riesgo elevado de malware, adware o robo de credenciales.
- Los enlaces de descarga apuntan a repositorios de GitHub ajenos al autor declarado en Hugging Face, lo que impide verificar la cadena de custodia del binario.
- Uso probablemente contrario a los términos de servicio del videojuego "Dead Rails"; posible riesgo de sanción de cuenta.
- Licencia MIT declarada en los metadatos, pero sin fichero de licencia verificable ni código fuente publicado que la respalde.
- Ausencia total de documentación técnica, benchmarks, auditorías o reproducibilidad.
- No debe ejecutarse en entornos de producción ni en máquinas con datos sensibles.
- No se han identificado sesgos de modelo porque no hay modelo; el riesgo relevante es de seguridad del software.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EarendelArc/dead-rails-script-portable
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Página de releases citada en la model card (GitHub de terceros): https://github.com/FetahiZo92/dead-rails-script-portable/releases/latest

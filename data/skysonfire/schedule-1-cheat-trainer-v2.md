# SkysOnFire/schedule-1-cheat-trainer-v2

## Resumen

El identificador `SkysOnFire/schedule-1-cheat-trainer-v2` no corresponde a un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un supuesto "cheat trainer" para el videojuego *Schedule 1*, distribuido como ejecutable portable para Windows de 64 bits. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje, visión o multimodal.

La model card del autor es, en la práctica, una página de descarga de un binario (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con contraseña) acompañada de tablas de características orientadas a *aimbot*, *ESP* (overlay de cajas delimitadoras y esqueletos), radar 2D y filtrado de objetos. No hay ninguna información sobre parámetros, contexto, datos de entrenamiento o benchmarks, porque no existe un modelo subyacente.

Por tanto, esta ficha documenta la ausencia de un modelo técnico evaluable y advierte de los riesgos asociados al artefacto publicado. Cualquier uso del repositorio como si fuera un modelo de IA sería un error de categoría; cualquier ejecución del binario descargado conlleva riesgos de seguridad no evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el repositorio contiene un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, referidos a la documentación del binario, no a capacidades lingüísticas de un modelo) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento ni proceso de ajuste (RLHF, DPO, SFT) que documentar. El contenido del repositorio es un binario compilado para Windows de 64 bits, presentado con un identificador de build (`v1.7.6` · `8B6D93ADD0`) y un nombre de fichero que hace referencia a otro juego (*Deadlock*), lo que sugiere una plantilla reutilizada o un señuelo.

La model card describe módulos de *overlay* externo a 144 Hz, capa de renderizado "stream-proof" para excluirse de OBS, ShadowPlay y Discord, desactivación por tecla de pánico (`END`), perfiles JSON intercambiables en caliente, radar 2D con filtro de botín y suavizado de entrada Bézier a 232 Hz de sondeo. Son descripciones de funcionalidad de un *cheat*, no de un sistema de IA, y no vienen acompañadas de código fuente, binarios verificables ni metodología reproducible.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los idiomas listados son metadatos de la ficha de descarga.
- No dispone de modo *thinking*, visión, audio ni multimodalidad.
- El artefacto distribuido se presenta como una herramienta externa para un videojuego, con funciones de *aimbot*, ESP, radar y filtrado de objetos según la propia model card.

## Casos de uso

- No aplica: al no ser un modelo de IA, no existen casos de uso legítimos de inferencia, generación o análisis.
- Evaluación de seguridad de la cadena de suministro: el repositorio puede servir como caso de estudio de *malware* o *scam* en plataformas de modelos, dado que simula ser un modelo con etiquetas de IA pero distribuye un ejecutable.
- Auditoría de políticas de plataforma: útil para estudiar cómo Hugging Face y otros *hubs* gestionan repositorios que no son modelos y que distribuyen binarios potencialmente dañinos.
- Investigación sobre ingeniería social: la model card emplea insignias de valoración, cifras de descargas y contraseñas de archivo para generar confianza, un patrón habitual en campañas de distribución de *malware*.
- Formación en análisis de artefactos: el ZIP y el ejecutable pueden analizarse en un entorno aislado para extraer indicadores de compromiso.
- No se recomienda ningún uso productivo, comercial ni doméstico del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica en el sentido de VRAM para inferencia: no hay pesos que cargar.
- El artefacto declarado requiere Windows 10 u 11 de 64 bits.
- Tamaño del paquete: 4,8 MB comprimido.
- No requiere GPU, NPU ni aceleradores; se presenta como ejecutable nativo de Windows.
- No se dispone de datos de latencia ni *throughput* verificables; las cifras de la model card (`< 11 ms`, `< 20 ms`, 232 Hz) son afirmaciones del autor sin metodología ni reproducción independiente.
- Opciones de despliegue en servidores de inferencia (vLLM, llama.cpp, Ollama, TGI): no aplica.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Como referencia de categoría, los repositorios legítimos de modelos en Hugging Face incluyen pesos en `safetensors` o GGUF, `config.json`, tokenizador y una model card con arquitectura, datos de entrenamiento y evaluación; ninguno de estos elementos está presente aquí.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- El binario distribuido no es verificable, no incluye código fuente y se entrega comprimido con contraseña, lo que dificulta el análisis y favorece la evasión de escáneres.
- El nombre del ejecutable hace referencia a *Deadlock*, no a *Schedule 1*, lo que indica posible reutilización de plantillas o suplantación.
- Riesgo elevado de *malware*, *stealer* de credenciales, *ransomware* o *minero*: ejecutar el `.exe` como administrador, tal como indica la model card, concede privilegios elevados a un binario no auditado.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del contenido; una licencia de software no exime de responsabilidad por daños.
- El uso de *cheats* en videojuegos puede violar los términos de servicio de las plataformas y acarrear el bloqueo de cuentas; en algunas jurisdicciones puede tener implicaciones legales.
- Los idiomas listados no implican soporte lingüístico real del artefacto.
- Cero descargas y cero *likes* en el momento de la consulta: sin validación comunitaria.
- Fecha de creación y actualización: 24 de noviembre de 2026, sin historial posterior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SkysOnFire/schedule-1-cheat-trainer-v2
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/rDixon7196/schedule-1-cheat-trainer-v2
- No se han encontrado papers, blogs técnicos, demos ni repositorios de código adicionales asociados a este identificador.

# hqdopp/solidworks-2026-sp1-premium-portugues-pt-b

## Resumen

El repositorio `hqdopp/solidworks-2026-sp1-premium-portugues-pt-b` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido es un ejecutable de Windows distribuido en un archivo ZIP (`solara-executor-v3-keyless-2026-v1.2.2-win64.zip`, 4,8 MB) que se presenta como un "roblox executor" y que se camufla bajo el nombre de una supuesta versión de SolidWorks 2026 SP1 Premium en portugués de Brasil. No hay pesos, tokenizador, configuración de arquitectura ni ningún componente propio de un modelo de lenguaje.

La model card es un señuelo de ingeniería social: incluye insignias falsas de descargas (285K+) y valoraciones (4,9/5), enlaces a repositorios de GitHub de terceros ajenos al autor declarado, una contraseña de descompresión (`2026`) y una instrucción explícita de ejecutar el binario como administrador. Estas prácticas son características de campañas de distribución de malware que abusan de plataformas de alojamiento de modelos para evadir filtros de seguridad.

Por tanto, esta ficha documenta el artefacto como lo que es —contenido no relacionado con IA y potencialmente malicioso— y no como un modelo evaluable. No existe información técnica de arquitectura, entrenamiento, capacidades o benchmarks que reseñar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas, sin relación con capacidades reales) |
| Licencia | mit (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido descrito en la model card es un binario `solara-executor-v3-keyless-2026-v1.2.2-win64.exe` (build `v3.8.1`, etiqueta `CC3EAF`) empaquetado en un ZIP de 4,8 MB protegido con contraseña. La card menciona componentes que no guardan relación con un modelo —"Monaco Editor Workspace", "multi-instance attach a 288 Hz", "98%+ sUNC compatibility", "auto-execute directory"— y que corresponden al vocabulario típico de herramientas de ejecución de scripts en Roblox, no a un transformer, MoE o SSM.

No se declara número de tokens de entrenamiento, composición de dataset, ni fases de RLHF, DPO o SFT. La etiqueta `region:us` y la lista de idiomas parecen copiadas de plantillas de model cards legítimas para dar apariencia de normalidad.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües reales pese a las 14 etiquetas de idioma declaradas.
- El artefacto ejecutable se anuncia como "executor" de Roblox con funciones de inyección de scripts (hookmetamethod, getgc, Drawing API), lo que implica manipulación de procesos en el sistema del usuario.

## Casos de uso

- No procede: no hay ningún caso de uso legítimo de IA para este repositorio.
- Auditoría de seguridad: un equipo de threat intelligence puede analizar el binario en un entorno aislado para identificar familia de malware, C2 y técnicas de evasión.
- Formación en concienciación: sirve como ejemplo real de typosquatting y abuso de Hugging Face para distribuir ejecutables.
- Monitorización de plataformas: útil para calibrar reglas de detección de repositorios que suben `.exe`/`.zip` con contraseña y enlaces externos.
- Investigación de campañas de "roblox executors": permite trazar la infraestructura de GitHub referenciada (`schneider6972`, `VikramBishop`).
- Denuncia y retirada de contenido: base para reportar el repositorio al equipo de Trust & Safety de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la card (285K+ descargas, 4,9/5, "99,4% consistency", "288 Hz") son afirmaciones de marketing sin verificación y no constituyen métricas de un modelo.

## Requisitos de hardware

- No aplica cómputo de inferencia de IA: no requiere VRAM ni GPU.
- El ejecutable está compilado para Windows 10/11 x64.
- Consumo declarado en la card: menos de 61 MB de RAM (dato no verificado).
- No se despliega con vLLM, llama.cpp, Ollama ni TGI; se ejecuta como proceso nativo de Windows.
- Riesgo relevante: la card pide ejecutarlo "como administrador", lo que otorga privilegios elevados a un binario no firmado.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo. Como referencia de categoría, los ejecutores de scripts para Roblox (Solara, Wave, Synapse) son software de terceros no oficial, frecuentemente asociados a riesgo de malware y prohibidos por los términos de servicio de la plataforma.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como tal carece de sentido.
- Fuerte indicio de malware: ZIP con contraseña, binario sin firma, instrucción de ejecutar como administrador y enlaces a repositorios de GitHub de terceros no vinculados al autor declarado.
- Suplantación de marca: usa el nombre de SolidWorks (Dassault Systèmes) sin autorización.
- Descargas y valoraciones falsas: las insignias de la card no son verificables y contradicen el contador real de Hugging Face (0 descargas, 0 likes).
- La licencia MIT declarada no otorga ninguna garantía sobre el binario ni exime de responsabilidad a quien lo ejecute.
- Riesgo de robo de credenciales, persistencia y exfiltración si se ejecuta en un equipo de trabajo.
- Recomendación: no descargar, no descomprimir y no ejecutar; reportar el repositorio a Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hqdopp/solidworks-2026-sp1-premium-portugues-pt-b
- Repositorio de GitHub referenciado en la card (no verificado): https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Repositorio de GitHub referenciado en la card (no verificado): https://github.com/VikramBishop/solidworks-2026-sp1-premium-portugues-pt-b
- Página de reporte de abuso de Hugging Face: https://huggingface.co/contact

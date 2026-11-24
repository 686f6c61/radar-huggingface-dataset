# OCPEX/revo-uninstaller-pro-5-ccleaner-6-pro

## Resumen

La ficha solicitada corresponde al identificador `OCPEX/revo-uninstaller-pro-5-ccleaner-6-pro` publicado en Hugging Face por el usuario OCPEX. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: la model card describe un supuesto instalador ejecutable para Windows x64 (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`), empaquetado en un ZIP de 4,8 MB protegido con contrasena, que se promociona con nombres de software comercial de terceros (Revo Uninstaller Pro 5 y CCleaner 6 Pro) y con funcionalidades descritas como manipulacion de identificadores de hardware (SMBIOS, UUID, seriales de disco), evasion de anticheats y limpieza de telemetria.

No existe informacion sobre arquitectura de red neuronal, parametros, tokenizador, datos de entrenamiento ni pesos en formato safetensors o GGUF. El repositorio no declara pipeline de Hugging Face, no tiene descargas ni likes, y su contenido encaja con el patron habitual de distribucion de binarios potencialmente no deseados: enlaces a repositorios de GitHub de terceros, contrasena fija en el archivo comprimido (`2026`), instrucciones para ejecutar como administrador y justificaciones para desactivar avisos de SmartScreen o Windows Defender.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA. Se documenta lo observado de forma rigurosa para advertir a desarrolladores e investigadores de que no deben tratar este repositorio como una fuente fiable de software ni ejecutar los binarios referenciados en entornos de produccion o personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos; aplicada a un binario, no a pesos) |
| Formato de pesos | no disponible (el artefacto referenciado es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No aplica. No hay descripcion de transformer, MoE, SSM ni arquitectura hibrida, ni referencias a tokens de entrenamiento, composicion de dataset, RLHF, DPO o tecnicas de decodificacion. La model card describe en su lugar modulos de un supuesto programa de Windows: auditor de seriales, enmascaramiento de seriales NVMe y SATA, gestion de TPM 2.0 en Windows 11 24H2, limpieza de telemetria, aleatorizacion de SMBIOS y UUID, y aislamiento frente a anticheats (EAC, BE, Ricochet). Estas afirmaciones no vienen acompanadas de documentacion tecnica verificable, codigo fuente ni artefactos reproducibles.

El unico contenido "tecnico" del repositorio son tablas de caracteristicas con cifras de rendimiento no contrastables (por ejemplo, tiempos de respuesta de 8 a 32 ms y consistencias del 96,3 % o 99,6 %), sin metodologia de medida ni entorno de prueba descrito.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue real mas alla de la lista de idiomas en metadatos.
- Las "capacidades" descritas en la model card son funcionalidades de un supuesto ejecutable de Windows (manipulacion de identificadores de hardware, limpieza de telemetria, evasion de anticheats), no capacidades de un modelo.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA, porque el artefacto no es un modelo.
- Evaluacion de riesgos de cadena de suministro: el repositorio puede usarse como ejemplo de patron de publicacion sospechoso (ZIP con contrasena, enlaces externos, instrucciones para desactivar antivirus) para formar a equipos de seguridad.
- Analisis de model cards en plataformas de modelos: util para estudiar como se camuflan binarios no deseados bajo nombres de software comercial.
- No se recomienda su uso en atencion al cliente, generacion de codigo, analisis documental, agentes, RAG ni ninguna otra aplicacion de IA.
- No se recomienda su descarga ni ejecucion en equipos de desarrollo, estaciones de trabajo ni servidores.
- Cualquier uso del binario referenciado queda fuera del alcance de esta ficha y conlleva riesgos de seguridad no evaluados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (tiempos de respuesta, porcentajes de consistencia, frecuencia de sondeo de 445 Hz) no son benchmarks de modelos de IA ni incluyen metodologia verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son reproducibles ni contrastables.
- Requisito descrito por el autor: Windows x64 (menciona Windows 11 24H2) y ejecucion como administrador del `.exe` referenciado.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo de IA. Cualquier comparacion con modelos de lenguaje, vision o audio seria inapropiada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuracion ni pipeline declarado.
- La model card usa nombres de productos comerciales de terceros (Revo Uninstaller Pro 5, CCleaner 6 Pro) sin relacion aparente con sus desarrolladores originales.
- El binario se distribuye en un ZIP protegido con contrasena y alojado en repositorios de GitHub de terceros, un patron habitual en campanas de distribucion de software no deseado.
- Las instrucciones incluyen ejecutar como administrador y justifican desactivar o ignorar avisos de Windows Defender y SmartScreen, lo que incrementa el riesgo de seguridad.
- Las funcionalidades descritas (manipulacion de SMBIOS, UUID, seriales de disco y evasion de anticheats) pueden contravenir terminos de servicio de plataformas y, segun la jurisdiccion, normativa aplicable.
- La licencia MIT declarada en metadatos no aporta garantias sobre el contenido ni sobre la procedencia del binario.
- Riesgo alto de alucinacion documental: la model card presenta afirmaciones tecnicas sin evidencia, codigo ni artefactos verificables.
- No debe desplegarse en produccion, ni en entornos corporativos, ni en equipos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OCPEX/revo-uninstaller-pro-5-ccleaner-6-pro
- Enlace de descarga referenciado en la model card (no verificado, no recomendado): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/hfransson107/revo-uninstaller-pro-5-ccleaner-6-pro/releases/latest
- Paper, blog o demo oficial: no disponible.

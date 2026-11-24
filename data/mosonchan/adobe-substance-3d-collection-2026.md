# mosonchan/adobe-substance-3d-collection-2026

## Resumen

El repositorio `mosonchan/adobe-substance-3d-collection-2026` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado como un supuesto instalador portable de "Adobe Substance 3D Collection 2026" para Windows 11 x64, distribuido mediante un archivo ZIP de 8,9 MB protegido con contraseña. La model card no describe ninguna arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento, sino instrucciones de descarga y ejecución de un binario `.exe`.

El artefacto se presenta con etiquetas propias de un modelo (`license:mit`, lista de idiomas, `region:us`), lo que puede inducir a confusión en búsquedas automatizadas dentro del Hub. Sin embargo, el contenido real es un ejecutable de terceros que afirma eliminar telemetría, desbloquear licencias de forma offline y acelerar por GPU mediante CUDA, TensorRT, DirectML y OpenCL. No hay evidencia alguna de que sea un modelo entrenado ni de que provenga de Adobe.

Desde la perspectiva de evaluación de modelos de IA, esta ficha no puede aportar especificaciones técnicas de inferencia porque no existen. El interés de documentarlo radica en señalar el riesgo: un paquete de 8,9 MB que se ejecuta como administrador y que se distribuye con contraseña es un vector habitual de malware, y su presencia en el Hub bajo apariencia de modelo es un caso de contaminación del catálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos, configuración de transformer, tokenizador ni dataset. El único artefacto descrito es `adobe-substance-3d-collection-2026-v1.2.0-win64.zip` (8,9 MB), que al extraerse con la contraseña `2026` produce un ejecutable `adobe-substance-3d-collection-2026-v1.2.0-win64.exe` etiquetado como build `v1.3.4 (68F904)`.

La model card menciona supuestas capacidades de "runtime sin telemetría", "licencias offline" y "aceleración GPU con CUDA, TensorRT, DirectML y OpenCL", pero no documenta ningún proceso de entrenamiento, composición de datos, RLHF, DPO ni innovación algorítmica. No hay información verificable sobre el origen del binario ni sobre su cadena de compilación.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje natural; los idiomas listados son metadatos del repositorio.
- El binario afirma realizar parcheo de directorios, configuración de reglas de firewall y activación local sin conexión, según la model card.
- No se documenta ninguna capacidad de visión, audio o modo de pensamiento.

## Casos de uso

- Ninguno recomendado en el ámbito de IA. El artefacto no es un modelo y no debe integrarse en pipelines de inferencia, RAG, agentes ni evaluación de benchmarks.
- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar si realiza acciones maliciosas, dado que solicita ejecución como administrador.
- Estudio de contaminación de catálogos: documentar cómo repositorios con etiquetas de modelo pueden alojar ejecutables y afectar a la confianza en el Hub.
- Formación en higiene de dependencias: usar este caso como ejemplo de por qué no deben ejecutarse binarios descargados de repositorios de modelos sin verificación de firma y procedencia.
- Monitorización de la cadena de suministro: incluir reglas que detecten artefactos `.exe`, `.zip` con contraseña o binarios de Windows en repositorios etiquetados como modelos.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, revisar persistencia, reglas de firewall modificadas y conexiones salientes según lo que la propia model card describe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica para inferencia. La model card menciona aceleración mediante CUDA, TensorRT, DirectML y OpenCL, pero sin especificar modelos de GPU ni requisitos de memoria.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles. La model card cita cifras de "< 4 ms de tiempo de respuesta" y "< 54 MB de RAM" para el ejecutable, pero son afirmaciones del autor sin verificación independiente y no corresponden a inferencia de un modelo.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable porque el artefacto no es un modelo. Tampoco procede compararlo con herramientas de creación 3D legítimas como Adobe Substance 3D Painter, Designer o Sampler, ya que este repositorio no es un producto de Adobe ni se distribuye por canales oficiales.

## Limitaciones y advertencias

- No es un modelo de IA: etiquetarlo como tal en el Hub es engañoso y puede contaminar búsquedas y pipelines automatizados.
- Riesgo de malware: un ZIP de 8,9 MB con contraseña que contiene un `.exe` que se ejecuta como administrador es un patrón clásico de distribución de software malicioso o no verificado.
- Suplantación de marca: el nombre "Adobe Substance 3D Collection" y la referencia a Adobe no están respaldados por Adobe; la licencia MIT declarada no otorga derechos sobre marcas de terceros.
- Sin verificación de integridad: la model card no publica hashes, firmas ni procedencia del binario.
- Modificación del sistema: la propia descripción menciona parcheo de directorios y configuración de reglas de firewall, lo que implica cambios en el sistema operativo del usuario.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de comunidad que respalde el artefacto.
- Licencia MIT declarada, pero irrelevante para un binario de terceros cuyo código fuente no se publica; no hay garantía de uso comercial seguro.
- No usar en producción, ni en entornos corporativos, ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mosonchan/adobe-substance-3d-collection-2026
- Referencia de descarga citada en la model card (no verificar ni ejecutar): https://github.com/Isabellev773/adobe-substance-3d-collection-2026/releases/latest
- Página oficial de Adobe Substance 3D (producto legítimo, no relacionado con este repositorio): https://www.adobe.com/es/products/substance3d.html
- Documentación del Hub de Hugging Face sobre modelos: https://huggingface.co/docs/hub/models

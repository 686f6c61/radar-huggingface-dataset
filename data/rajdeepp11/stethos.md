# rajdeepp11/stethos

## Resumen

Stethos 0.1.0 no es un modelo de lenguaje en el sentido habitual, sino un repositorio de distribución de instaladores de escritorio para una aplicación offline de diagnóstico respiratorio. El autor, Rajdeep Putta (usuario `rajdeepp11` en Hugging Face), publica aquí los binarios de la aplicación Stethos, que integra varios clasificadores (sonidos respiratorios, radiografía de tórax y espirometría) y fusiona sus salidas en una evaluación de riesgo con desglose por modalidad. El repositorio existe únicamente porque los paquetes con CUDA rondan los 3 GB cada uno y superan el límite de 2 GB por asset de GitHub Releases.

La aplicación está construida con Tauri (interfaz web sobre núcleo Rust) y ejecuta toda la inferencia de forma local: no hay llamadas a servicios externos ni descarga de pesos en el primer arranque, ya que el motor de inferencia y los pesos van empaquetados dentro del instalador. Genera informes exportables en PDF, FHIR, DICOM-SR y JSON. El repositorio ocupa 13,9 GB y no contiene una model card técnica con arquitectura, parámetros o benchmarks, sino instrucciones de instalación.

Por tanto, esta ficha documenta un artefacto de distribución de software médico de investigación, no un modelo abierto reutilizable. Cualquier evaluación de sus capacidades predictivas requeriría acceso al código fuente o a los pesos internos, que no se publican de forma independiente en este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (aplicación de escritorio Tauri; los clasificadores internos no se documentan) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo generativo de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos empaquetados dentro de los instaladores; no se distribuyen como safetensors o GGUF) |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura de los clasificadores internos ni sobre los datos de entrenamiento. La model card solo describe la capa de aplicación: un frontend empaquetado con Tauri que se comunica con un servicio local de inferencia expuesto en `http://127.0.0.1:8765`, con un endpoint `/health` que informa del dispositivo activo (`cuda` o CPU) y del nombre de la GPU detectada. En macOS sobre Apple silicon se usa Metal (MPS) de forma automática; en Linux con los paquetes CUDA se requiere un driver compatible con CUDA 13.0 (versión 580 o superior) y, en caso contrario, se produce una caída a CPU.

La aplicación cubre tres modalidades de entrada (sonidos respiratorios, radiografía de tórax y espirometría) y realiza una fusión de sus resultados en una puntuación de riesgo con desglose por modalidad. No se detalla si la fusión es un ensamblado tardío, un modelo conjunto o una heurística de agregación, ni si hubo entrenamiento con datos clínicos, validación externa o ajuste fino con feedback humano.

## Capacidades

- Clasificación de sonidos respiratorios a partir de grabaciones de audio.
- Clasificación de radiografías de tórax.
- Procesamiento de datos de espirometría.
- Fusión multimodal de las tres señales en una evaluación de riesgo con desglose por modalidad.
- Exportación de informes en PDF, FHIR, DICOM-SR y JSON.
- Ejecución completamente offline: la inferencia no envía datos fuera de la máquina.
- Aceleración por GPU en Linux mediante paquetes con CUDA 13 y en macOS Apple silicon mediante Metal (MPS).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni generación de texto libre.

## Casos de uso

- Triaje preliminar en entornos con conectividad limitada: la aplicación funciona sin red y sin descargar pesos, lo que permite desplegarla en consultorios rurales o unidades móviles donde no se puede garantizar acceso a servicios en la nube.
- Investigación clínica con datos sensibles: al ejecutarse íntegramente en local, evita la transferencia de radiografías y audios respiratorios a terceros, lo que simplifica el cumplimiento de requisitos de protección de datos en estudios piloto.
- Docencia y simulación: permite a estudiantes practicar la interpretación de auscultación, radiografía y espirometría con una segunda opinión automatizada y un informe estructurado exportable.
- Integración en flujos FHIR: la exportación en FHIR y DICOM-SR facilita incorporar los resultados a historiales electrónicos o a visores DICOM existentes sin desarrollo adicional.
- Evaluación comparativa de modalidades: el desglose por modalidad permite analizar qué señal aporta más información en cada caso, útil para investigar la contribución relativa de audio, imagen y función pulmonar.
- Prototipado de productos de salud respiratoria: al ser MIT, un equipo puede partir de los instaladores para validar la experiencia de usuario y el flujo de informes antes de invertir en un modelo propio.
- Auditoría de privacidad: sirve como referencia de arquitectura para aplicaciones médicas que deban demostrar que ningún dato cruza la frontera del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de sensibilidad, especificidad, AUC ni comparaciones con otros sistemas, y tampoco se documentan latencias o throughput del motor de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los paquetes CUDA ocupan aproximadamente 3 GB, lo que incluye CUDA 13 y los pesos, pero no se especifica la VRAM necesaria en tiempo de ejecución.
- GPU recomendadas: no disponible. Solo se indica compatibilidad con CUDA 13.0 (driver 580 o superior) en Linux y con Metal en Apple silicon.
- Compatibilidad con GPU de consumo: no confirmada. Al no publicarse la VRAM requerida, no se puede afirmar que quepa en una RTX 4090 u otras tarjetas de consumo.
- Despliegue: instaladores nativos para Windows 10/11 x64 (`.exe`, `.msi`), macOS 11+ Apple silicon (`.dmg`), Debian/Ubuntu/Mint (`.deb`), Fedora/openSUSE (`.rpm`), Arch/CachyOS/Manjaro (`.pkg.tar.zst`) y AppImage para cualquier Linux sin root. No se ofrece despliegue mediante vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias en Linux: `libwebkit2gtk-4.1` y `libgtk-3-0`, declaradas por los paquetes; el asistente de AppImage instala por usuario en `~/.local`.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada modelos comparables de clasificación respiratoria multimodal distribuidos como aplicación de escritorio offline con licencia MIT, ni el repositorio ofrece datos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un dispositivo médico: la propia model card indica que es una herramienta de investigación y que los hallazgos deben confirmarse con un clínico.
- Ausencia total de documentación técnica sobre los clasificadores: sin arquitectura, datos de entrenamiento, métricas ni validación externa, no es posible evaluar su fiabilidad.
- Riesgo de alucinación y de falsos positivos o negativos clínicamente relevantes: al no publicarse sensibilidad ni especificidad, no se puede acotar el error esperado en ninguna de las tres modalidades.
- Sesgos desconocidos: no se documenta la composición demográfica, geográfica ni clínica de los datos de entrenamiento, por lo que se desconoce su comportamiento en poblaciones distintas de la de desarrollo.
- Cobertura lingüística limitada al inglés, incluida la interfaz y los informes.
- Los instaladores de macOS están firmados de forma ad-hoc; Gatekeeper puede bloquear el primer arranque y requiere autorización manual desde Ajustes del sistema.
- Los paquetes CUDA y CPU comparten nombre de archivo: instalar ambos produce conflictos, según advierte el autor.
- La licencia MIT permite uso comercial, pero no exime del cumplimiento de la normativa sanitaria aplicable (por ejemplo, marcado CE como producto sanitario en la Unión Europea) si se pretende usar en decisiones clínicas.
- El repositorio no contiene pesos sueltos ni código fuente, lo que impide auditar el modelo o reutilizarlo fuera de la aplicación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rajdeepp11/stethos
- Release v0.1.0 en GitHub: https://github.com/RajdeepSaiPutta/stethos/releases/tag/v0.1.0
- Perfil del autor en Hugging Face: https://huggingface.co/rajdeepp11
- Listado de modelos del autor: https://huggingface.co/rajdeepp11/models

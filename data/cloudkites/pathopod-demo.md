# cloudkites/pathopod-demo

## Resumen

PathoPod y PathoEdge son un sistema de patología digital desarrollado por CloudKites AI Lab, presentado en este repositorio de Hugging Face como material de demostración en vídeo (en vietnamita). No se trata de un modelo de lenguaje o de visión con pesos publicados, sino de una demo funcional de un sistema completo de gestión de un departamento de anatomía patológica: PathoPod es el servidor local que aloja un PACS (DICOMweb), un LIS y un visor de imágenes de portaobjetos completos, mientras que PathoEdge es el componente situado junto al escáner que recibe las imágenes, las verifica y las convierte a DICOM WSI.

El repositorio (0,1 GB) contiene exclusivamente vídeos demostrativos en vietnamita que recorren el flujo de trabajo completo de un caso clínico simulado: recepción, macroscopía, técnica histológica, tinción inmunohistoquímica, escaneo, asignación, lectura con ayuda de IA y firma. La IA destacada cuantifica ER, PR, HER2 y Ki-67 sobre imágenes de portaobjetos completos, ejecutándose en local sin enviar datos de pacientes al exterior.

Es relevante como referencia de arquitectura de despliegue on-premise para patología digital y como ejemplo de integración HL7/DICOMweb en un entorno hospitalario. Sin embargo, no es un modelo entrenado reutilizable: no hay pesos, no hay arquitectura de red especificada y la licencia restringe el uso a investigación. Los datos del paciente son simulados y las imágenes de portaobjetos proceden del conjunto público ACROBAT (CC BY 4.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sistema de aplicaciones: PACS DICOMweb, LIS, visor WSI y modulo de IA de cuantificacion; no se especifica la arquitectura del modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (interfaz, subtitulos y locucion sintetizada) |
| Licencia | other (uso exclusivo para investigacion; no es dispositivo medico) |
| Formato de pesos | No disponible (el repositorio contiene videos MP4, no pesos de modelo) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo de IA subyacente. Lo que sí se detalla es la arquitectura del sistema: PathoPod se ejecuta en un servidor local (pod1) con un PACS compatible con DICOMweb, un LIS para todos los roles del departamento y conectividad HL7 con el hospital. PathoEdge reside junto al escáner, recibe las imágenes de portaobjetos completos desde el ordenador del escáner, verifica su integridad mediante SHA-256, las convierte a DICOM WSI y las almacena en el PACS de PathoPod.

El módulo de IA cuantifica la expresión de ER, PR, HER2 y Ki-67 contando núcleos sobre imágenes de portaobjetos completos, con el patólogo definiendo las regiones de recuento y validando el resultado antes de incorporarlo al informe. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) para este componente. La locución de los vídeos emplea síntesis de voz local con Piper, modelo vi_VN-vais1000 entrenado sobre VAIS-1000 (CC BY 4.0). Las imágenes histológicas del caso demostrativo proceden de ACROBAT (CC BY 4.0), escaneadas con Hamamatsu a 10×.

## Capacidades

- Gestión integral del flujo de trabajo de anatomía patológica con control de acceso basado en roles (12 roles definidos: jefe de servicio, patólogo, admisión, macroscopía, técnico histológico, técnico de IHQ/ISH, operador de escáner, biología molecular, citología, gestor de laboratorio, administrador de TI y auditor).
- PACS DICOMweb con almacenamiento y visualización de imágenes de portaobjetos completos.
- LIS con registro de pacientes, casos, muestras, bloques y portaobjetos, e impresión de etiquetas con código de barras.
- Integración HL7 con el sistema de información hospitalario.
- Recepción de imágenes desde el escáner con verificación de integridad SHA-256 y conversión a DICOM WSI.
- Cuantificación asistida por IA de ER, PR, HER2 y Ki-67 sobre WSI, con recuento nuclear y validación por el patólogo.
- Gestión de tinciones IHQ/ISH con control de calidad (anticuerpos, lotes, caducidad, controles).
- Firma electrónica de informes, cofirma por residentes y generación de PDF (borrador y firmado).
- Panel de control con tiempos de respuesta (TAT), carga de trabajo y registro de auditoría.
- Interfaz completa en vietnamita con locución sintetizada local.

## Casos de uso

- Despliegue on-premise en un departamento de anatomía patológica: el sistema completo se ejecuta en un servidor local, sin enviar datos de pacientes al exterior, lo que facilita el cumplimiento de requisitos de soberanía del dato en entornos sanitarios.
- Digitalización de portaobjetos con conversión a DICOM WSI: PathoEdge recibe las imágenes del escáner, verifica su integridad y las archiva en el PACS, automatizando el paso de la microscopía analógica al archivo digital.
- Cuantificación de biomarcadores en cáncer de mama: el módulo de IA cuenta núcleos en regiones seleccionadas por el patólogo para ER, PR, HER2 y Ki-67, reduciendo la variabilidad interobservador en el recuento manual.
- Gestión de laboratorio con trazabilidad completa: desde la recepción de la muestra hasta la firma del informe, con registro de auditoría de cada acción y control de acceso por rol.
- Formación y validación de flujos de trabajo: los vídeos en tiempo real sirven como material de referencia para diseñar o evaluar sistemas de patología digital antes de invertir en infraestructura.
- Integración con sistemas hospitalarios: la conectividad HL7 permite incorporar el sistema a la infraestructura existente del hospital sin sustituir el HIS.
- Control de calidad de tinciones: la gestión de anticuerpos, lotes y portaobjetos de control facilita el cumplimiento de los protocolos de QC en inmunohistoquímica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican los requisitos del módulo de IA).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: el sistema se ejecuta en un servidor local (pod1) con PACS DICOMweb y LIS; PathoEdge se ejecuta junto al escáner. La síntesis de voz emplea Piper en local. No se detallan los motores de inferencia del módulo de IA.
- Latencia y throughput: no disponible. Los vídeos son en tiempo real, sin aceleración, pero no se aportan métricas de rendimiento del sistema.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| PathoPod / PathoEdge (CloudKites) | Sistema de patología digital con IA | PACS + LIS + cuantificación IHQ on-premise | other (solo investigación) | Demo en vídeo, sin pesos |
| QuPath | Software de análisis de patología | Análisis de WSI de código abierto | GPL | Código abierto |
| Orbit Image Analysis | Plataforma de análisis de imagen | Análisis de WSI con modelos de IA | Código abierto | Código abierto |

No se dispone de datos de rendimiento comparables entre estas herramientas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni código reutilizable: es únicamente material de demostración en vídeo.
- Uso exclusivo para investigación: el sistema no es un dispositivo médico y no ha sido validado para uso clínico.
- Licencia "other" sin texto completo en la información disponible; es imprescindible revisar los términos antes de cualquier uso, especialmente comercial.
- Los datos de pacientes de la demo son simulados (nombres con "Demo"); las imágenes histológicas proceden de un conjunto público (ACROBAT).
- No se especifican sesgos, tasas de alucinación ni limitaciones del módulo de IA.
- La interfaz y la documentación están en vietnamita, lo que limita su evaluación directa por parte de equipos no familiarizados con el idioma.
- No hay información sobre validación clínica, sensibilidad ni especificidad del recuento de biomarcadores.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de mantenimiento o soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cloudkites/pathopod-demo
- Vídeo 1 (recepción): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/01-tiep-nhan.mp4
- Vídeo 2 (macroscopía): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/02-pha-benh-pham.mp4
- Vídeo 3 (técnico histológico): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/03-ky-thuat-vien-mo-benh-hoc.mp4
- Vídeo 4 (IHQ/ISH): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/04-ky-thuat-vien-hmmd.mp4
- Vídeo 5 (PathoEdge, escáner a PACS): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/06-pathoedge-may-quet-den-pacs.mp4
- Vídeo 6 (operador de escáner): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/05-van-hanh-may-quet.mp4
- Vídeo 7 (jefe de servicio): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/09-truong-khoa.mp4
- Vídeo 8 (IA de cuantificación IHQ): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/15-ai-dinh-luong-hmmd-ung-thu-vu.mp4
- Vídeo 9 (residente): https://huggingface.co/cloudkites/pathopod-demo/resolve/main/video/ (ruta truncada en la información disponible)

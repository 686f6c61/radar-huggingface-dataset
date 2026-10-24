# eingel/cacao-detector

## Resumen

`eingel/cacao-detector` es un repositorio de Hugging Face que empaqueta un sistema de visión artificial para Raspberry Pi, no un modelo de lenguaje. Su pieza central es un clasificador binario de imágenes (`cls_ncnn_model`) que distingue granos de cacao buenos (`good`) de defectuosos (`bad`), integrado en una aplicación con cámara, detección por color, tracking y un expulsor accionado por servo. El repositorio incluye instalador, servicio systemd, actualizador OTA, interfaz web en el puerto 8000 y herramientas de calibración y captura de datos.

El problema que aborda es la clasificación automática de granos en una cinta transportadora con recursos de cómputo muy limitados: la inferencia se ejecuta en la CPU de la Raspberry Pi con pesos en formato NCNN. El autor documenta que el modelo se entrenó con datos públicos bajo un criterio simple de luminosidad («claro=good, oscuro=bad»), lo que provoca errores con luz real, y por eso el flujo de trabajo incluye captura de datos reales en la Pi y reentrenamiento en Colab mediante un notebook específico.

Su interés actual es como ejemplo de despliegue de extremo a extremo en el borde: actualizaciones por etapas con consentimiento del usuario, rollback automático si la nueva versión no produce vídeo, separación entre código versionado y configuración local, y funcionamiento offline con la última versión instalada. No hay datos publicados sobre arquitectura, parámetros, licencia ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; el repositorio distribuye un clasificador de imágenes en formato NCNN (`cls_ncnn_model`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, no procesa texto) |
| Tipos de cuantización | no disponible; los pesos se distribuyen como modelo NCNN |
| Idiomas soportados | no aplica (no procesa lenguaje); documentación e interfaz en castellano |
| Licencia | no disponible |
| Formato de pesos | NCNN (`cls_ncnn_model`, directorio de modelo para el runtime NCNN) |
| Tarea | clasificación binaria de recortes de granos de cacao (good / bad) |
| Pipeline de Hugging Face | no disponible |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0.0 GB |
| Fecha de creación / actualización | 2026-06-25 / 2026-10-23 |
| Etiquetas del repo | `region:us` |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del clasificador. Por la documentación se deduce un pipeline en dos etapas: una detección por color sobre el fondo o banda (modos `green`, `light`, `dark`) con tracking de cada grano, y un clasificador de recortes que asigna la etiqueta `good` o `bad`. Existe además un «modelo detector» opcional, con el flag `--every N` para inferir solo uno de cada N fotogramas, pero sus características no se especifican. El modo de detección es automático: si hay clasificador de recortes, se usa color + tracking.

El entrenamiento se realiza en Colab con el notebook `notebooks/entrenar_clasificador_binario_v4.ipynb`. El dataset se genera con `scripts/build_beans_cls_dataset.py`, que crea tiles sintéticos que imitan la banda verde con blending, sombras y rotación, e incorpora capturas reales con oversampling ×3. El autor indica que el modelo inicial aprendió de datos públicos con una regla de luminosidad («claro=good, oscuro=bad») y que ese criterio falla bajo iluminación real; el flujo de reentrenamiento con datos propios es, según la model card, «el paso que arregla la clasificación de verdad». No hay información sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Clasificación binaria de recortes de granos de cacao en `good` / `bad` con umbral de confianza configurable (`--conf`, por defecto 0.4).
- Detección y seguimiento de granos sobre cinta mediante segmentación por color del fondo (verde, claro u oscuro).
- Control de un expulsor mediante servo: desvío de los granos clasificados como `bad` aguas abajo de la cámara (prototipo v0.2).
- Interfaz web local servida en `http://<ip-de-la-pi>:8000`, con panel de ajustes (⚙) para umbral, fondo, línea de disparo, servo y cámara.
- Modo kiosco: arranque a pantalla completa con Chromium al encender la Raspberry Pi.
- Actualización OTA con consentimiento: descarga y prepara versiones estables cada 15 minutos, aplica al confirmar o al reiniciar, y revierte si la nueva versión no produce vídeo.
- Funcionamiento offline con la última versión instalada.
- Captura de recortes para reentrenamiento (`--detect-only --capture DIR`), desactivada en el servicio para no llenar el disco.
- Endpoint de salud (`/health`) y registro vía journalctl para monitorización.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modalities de texto, audio o vídeo generativo.

## Casos de uso

- Clasificación en línea de granos en una planta de procesamiento: la Pi ejecuta el clasificador sobre los recortes detectados en la cinta y activa el servo para desviar los granos defectuosos, sin depender de un servidor externo.
- Control de calidad en cooperativas o almacenes pequeños: instalación de bajo coste con cámara y Raspberry Pi que ofrece una interfaz web local para operarios, sin necesidad de infraestructura cloud.
- Prototipo docente o trabajo de fin de grado: el repositorio sirve como ejemplo completo de visión en el borde, con separación de módulos (`camera.py`, `vision.py`, `tracking.py`, `servo.py`, `display.py`, `web.py`, `app.py`), tests y publicador.
- Despliegue en entornos sin conectividad: la Pi sigue operando con la última versión instalada cuando no hay Internet, algo habitual en plantas rurales o temporadas de cosecha.
- Reentrenamiento para otro producto o variedad: el pipeline de captura, etiquetado manual en carpetas `good`/`bad`, regeneración del dataset y entrenamiento en Colab es reutilizable para otras semillas o frutos con cambios mínimos.
- Base para un sistema de MLOps de borde: el mecanismo `stable.json` + `--stage` / `--apply` / `--apply-boot` con validación de hashes y rollback automático sirve como referencia para distribuir actualizaciones de modelos a flotas de dispositivos.
- Monitorización remota de estado: consulta periódica de `/health` y de los logs de `cacao.service` y `cacao-update.timer` desde un sistema de alertas.
- Integración con actuadores industriales: el modo `sim` permite validar la lógica de eyección antes de conectar el servo real, y la calibración de tiempos se ajusta desde `config.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente describe un caso de fallo observado de forma cualitativa: con luz real, un grano cortado se clasificó como `good` con confianza 1.00, lo que motivó el flujo de reentrenamiento con datos propios. No se aportan métricas de precisión, recall, F1, latencia ni throughput.

## Requisitos de hardware

- Plataforma objetivo: Raspberry Pi con Raspberry Pi OS; el modelo concreto de Pi no se especifica.
- Inferencia en CPU mediante el runtime NCNN; no se requiere GPU.
- VRAM: no aplica; no se publica el consumo de RAM del clasificador ni del servicio completo.
- Cámara: no se especifica modelo; la calibración se realiza con `enfocar.py`, cuyo botón «Guardar» escribe `camara.sh` fuera de las versiones desplegadas.
- Servo: requiere fuente externa de 5 V y tierra común; no debe alimentarse desde la Pi. Calibrar tiempos antes de pasar de `servo: sim` a `servo: 18`.
- Almacenamiento: la captura continua está desactivada en el servicio para no llenar el disco; las capturas para reentrenamiento se hacen en sesiones técnicas.
- Despliegue: `deploy/install.sh` crea `/opt/cacao-detector/current`, `/var/lib/cacao-detector/config.json`, `cacao.service`, `cacao-update.timer`, `cacao-apply.path` y `cacao-apply-boot.service`.
- Latencia y throughput: no disponibles. El flag `--every N` permite reducir la frecuencia de inferencia cuando se usa el modelo detector.
- No aplican opciones de despliegue para LLM (vLLM, llama.cpp, Ollama, TGI); el servicio se ejecuta como aplicación Python con systemd y servidor web local.

## Comparativa con modelos similares

No hay datos públicos de parámetros, contexto ni rendimiento que permitan una comparación cuantitativa con alternativas. La siguiente tabla es únicamente cualitativa.

| Alternativa | Tipo | Datos comparables | Licencia | Disponibilidad |
|---|---|---|---|---|
| `eingel/cacao-detector` | Clasificador binario de imágenes en NCNN para Raspberry Pi, con pipeline de eyección | no disponibles | no disponible | Repositorio público en Hugging Face |
| Clasificador de imágenes genérico reentrenado (MobileNet, ResNet u otro exportado a NCNN o TFLite) | Clasificación de imágenes | Requiere dataset y reentrenamiento propios; parámetros según el modelo base, no disponibles en esta ficha | Según el modelo base | Pública |
| Sistema comercial de inspección visual de granos | Solución llave en mano con hardware y software | no disponibles | Propietaria | Comercial |
| Pipeline artesanal con OpenCV y umbrales de color | Visión clásica sin aprendizaje profundo | no disponibles | Según librerías | Pública |

La ventaja diferencial del repositorio frente a un clasificador genérico no es el rendimiento del modelo, sino el sistema completo: instalación, actualización con rollback, interfaz local y captura para reentrenamiento.

## Limitaciones y advertencias

- El propio autor reconoce que el modelo actual aprendió de datos públicos con una regla de luminosidad («claro=good, oscuro=bad») y que se equivoca bajo luz real; el caso documentado es un grano cortado clasificado como `good` con confianza 1.00.
- La clasificación depende críticamente del balance de blancos y de la iluminación: el balance automático se engaña con la banda verde y tiñe la escena de rosa, por lo que hay que fijarlo manualmente con `enfocar.py`.
- Dependencia del color de fondo o banda (`green`, `light`, `dark`): cambios de fondo, de cinta o de iluminación pueden degradar la detección por color y el tracking.
- Solo realiza clasificación binaria (`good` / `bad`); no distingue tipos de defecto ni proporciona evaluación granular de calidad.
- No hay licencia declarada, lo que genera incertidumbre legal para uso comercial o para redistribuir el modelo y el código.
- No se especifican arquitectura, número de parámetros ni métricas, lo que impide estimar su comportamiento fuera del caso de uso previsto.
- El repositorio es público y la Pi no guarda sesión ni token; el publicador sí requiere autenticación en Hugging Face, lo que introduce un punto de confianza en el proceso de publicación.
- Las actualizaciones dependen de conectividad intermitente: sin Internet se mantiene la última versión instalada, pero no se reciben correcciones.
- El servo no debe activarse sin fuente externa de 5 V y tierra común; hacerlo puede dañar la Raspberry Pi.
- Riesgo de alucinación no aplicable (no es un modelo generativo); el riesgo equivalente es la clasificación errónea con alta confianza.
- No hay información sobre sesgos del dataset más allá del criterio de luminosidad y de los tiles sintéticos generados.
- La captura continua está desactivada por defecto para no llenar el disco; cualquier recolección de datos requiere intervención técnica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/eingel/cacao-detector
- `stable.json`: fichero de versión estable publicado en el propio repositorio de Hugging Face (consultado al arrancar y cada 15 minutos).
- Notebook de entrenamiento: `notebooks/entrenar_clasificador_binario_v4.ipynb` (dentro del repositorio).
- Generación del dataset: `scripts/build_beans_cls_dataset.py`.
- Script de publicación: `publish.py` (`--publish`).
- Aplicación de inferencia: `inference_v2.py` (con `--selftest`, `--web`, `--detect-only`, `--capture`, `--conf`, `--every`, `--bg`).
- Calibración de cámara: `enfocar.py` y `camara.sh`.
- Instalador y despliegue: `deploy/install.sh`, `cacao.service`, `cacao-update.timer`, `cacao-apply.path`, `cacao-apply-boot.service`.
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.

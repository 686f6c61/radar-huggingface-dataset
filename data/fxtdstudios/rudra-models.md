# fxtdstudios/rudra-models

## Resumen

RUDRA models es un paquete de dos artefactos publicados por FXTD Studios para la reconstrucción de HDR escena-lineal a partir de material SDR de 8 bits, orientado a VFX y etalonaje. El primero, RUDRA ACES 2, es un modelo de reconstrucción aprendida de ACES 2.0 que acepta una imagen SDR de 8 bits y produce un master en ACEScg cuya vista SDR ACES 2.0 a 100 nits conserva exactamente los códigos de 8 bits de la fuente. Se distribuye como TorchScript y ONNX (DirectML, Core ML o CPU) y ocupa solo 2,2 MB.

El segundo, RUDRA AI fill v3, es un LoRA sobre el modelo de difusión vídeo Wan2.1-VACE-1.3B que dibuja la forma dentro de zonas de altas luces totalmente recortadas (código 255), acompañado de un estimador de brillo (`brightness.json`) que fija cuánta luminosidad añadir. No recupera información real: genera contenido plausible y lo marca en un canal EXR `rudra.generated`. Es una función experimental y desactivada por defecto en la aplicación RUDRA.

El interés del paquete es doble: por un lado, una transformación determinista y verificable (ACES 2 con preservación bit a bit de códigos); por otro, un uso poco habitual de un modelo de difusión vídeo como herramienta de relleno de recortes en postproducción, con licencia Apache 2.0 y datos de entrenamiento libres de restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RUDRA ACES 2: modelo de reconstrucción aprendida (arquitectura no detallada), exportado a TorchScript y ONNX. RUDRA AI fill v3: LoRA sobre el transformer de difusión vídeo Wan2.1-VACE-1.3B |
| Parametros totales | No disponible (el LoRA ocupa 271 MB; el modelo base Wan2.1-VACE-1.3B tiene 1,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el LoRA se distribuye en safetensors; el modelo base en formato diffusers) |
| Idiomas soportados | No disponible (modelo de imagen/vídeo, no lingüístico) |
| Licencia | Apache 2.0 (Copyright 2026 FXTD Studios; Wan2.1-VACE-1.3B es © Wan-AI bajo Apache 2.0) |
| Formato de pesos | TorchScript y ONNX (ACES 2); safetensors (LoRA AI fill v3); diffusers (modelo base) |

## Arquitectura y entrenamiento

RUDRA ACES 2 es un modelo de reconstrucción aprendida de la transformación ACES 2.0: toma una imagen SDR de 8 bits y genera un master ACEScg cuya vista SDR ACES 2.0 a 100 nits reproduce los códigos de 8 bits originales. La model card no detalla la arquitectura interna (capas, tipo de red ni función de pérdida); solo indica que se exporta a TorchScript y ONNX para ejecución en DirectML, Core ML o CPU, lo que sugiere un modelo pequeño y de inferencia ligera.

RUDRA AI fill v3 es un LoRA entrenado sobre Wan2.1-VACE-1.3B, un transformer de difusión para vídeo con control de referencia. El LoRA aprende a dibujar la forma del contenido dentro de regiones completamente recortadas, mientras que un estimador de brillo independiente (`brightness.json`) decide la magnitud en stops. Los datos de entrenamiento son comercialmente limpios: HDRIs de Poly Haven (CC0), material y renders propios de FXTD Studios, escenas generadas proceduralmente y plates CC0. La evaluación es pre-registrada (30 de octubre de 2026) sobre 58 clips, con veredicto restringido a 25 escenas de Poly Haven nunca vistas durante el entrenamiento.

## Capacidades

- Reconstrucción SDR a HDR escena-lineal con preservación exacta de los códigos de 8 bits en la vista SDR ACES 2.0 a 100 nits.
- Generación de master en ACEScg a partir de entrada SDR de 8 bits.
- Relleno de altas luces totalmente recortadas (código 255) mediante difusión vídeo, añadiendo como máximo +3 stops sobre el master.
- Estimación automática de brillo para las zonas rellenadas, con desplazamiento manual configurable (±3 stops).
- Marcado de cada píxel generado en el canal EXR `rudra.generated`.
- Copia bit a bit de los píxeles no modificados.
- Ejecución en Windows y macOS (Metal en Apple Silicon) mediante la aplicación RUDRA, y por línea de comandos.
- No dispone de tool calling, capacidades de agente ni soporte multilingüe: no es un modelo de lenguaje.

## Casos de uso

- Restauración de archivo SDR para remasterización HDR: aplicar RUDRA ACES 2 a material de 8 bits para obtener un master ACEScg cuya vista SDR sea idéntica al original, lo que permite trabajar en HDR sin alterar la referencia aprobada.
- Etalonaje en pipeline ACES: usar el master ACEScg como punto de partida para el grade, sabiendo que la vista SDR a 100 nits conserva los códigos de la fuente y que el modelo es determinista y verificable por SHA-256.
- Relleno de cielos y luces quemadas en planos VFX: AI fill v3 dibuja la forma dentro de recortes totales (por ejemplo, ventanas o fuentes de luz), limitado a +3 stops, adecuado para planos donde el recorte es pequeño y el relleno resulta neutro.
- Previsualización rápida en postproducción: generar un master HDR aproximado para revisión de look antes de un grade definitivo, con la ventaja de que los píxeles generados quedan marcados y son auditables.
- Integración en pipelines automatizados: ejecutar `rudra-native aces-v2` sobre secuencias o películas completas desde línea de comandos, con verificación de integridad de los ficheros descargados.
- Investigación en inverse tone mapping: el paquete incluye una evaluación pre-registrada con métricas reproducibles (error log2 frente al inverso exacto, detalle PU21, estimación de brillo, flicker y costuras de ventana), útil como referencia metodológica.
- Formación y docencia en color science: el tamaño reducido de ACES 2 (2,2 MB) y su exportación ONNX permiten desplegarlo en entornos con recursos limitados para demostrar flujos ACES 2.0.

## Benchmarks y rendimiento

Evaluación de AI fill v3 (pre-registrada, 30 de octubre de 2026; 58 clips, veredicto sobre 25 escenas de Poly Haven no vistas):

| Metrica | Resultado |
|---|---|
| Error log2 en altas luces recortadas frente al inverso exacto | −0,128 stops (IC 95 %: −0,226 … −0,042) |
| Detalle (PU21) a −3 EV | −7,1 (menor es mejor) |
| Detalle (PU21) a −6 EV | −6,5 (menor es mejor) |
| Estimación de brillo frente a no aplicarla | −0,199 stops (IC: −0,339 … −0,076); sobredesviación > 1 stop en el 3,3 % |
| Códigos de 8 bits | conservados |
| Sombras | sin cambios |
| Flicker | 0,007 EV |
| Costuras de ventana | 1,0 |

En metraje con áreas recortadas pequeñas el efecto es neutro. No se han publicado resultados de benchmarks para RUDRA ACES 2 en la información disponible.

## Requisitos de hardware

- RUDRA ACES 2: 2,2 MB en disco; ejecutable en CPU mediante ONNX (DirectML en Windows, Core ML en macOS), sin requisitos de GPU dedicada indicados.
- RUDRA AI fill v3: requiere GPU de 16 GB; en Mac, 16 GB de memoria o más y ejecución sobre Metal.
- Modelo base necesario: Wan2.1-VACE-1.3B-diffusers (debe descargarse aparte y configurarse en la aplicación o colocarse en `<RUDRA folder>/models/genfill/`).
- Dependencia de Python para el flujo de AI fill (`scripts\GENFILL.ps1 -Setup` en Windows, `scripts/genfill_setup.sh` en macOS).
- Opciones de despliegue: aplicación RUDRA (Windows y macOS), línea de comandos `rudra-native aces-v2` y `python -m rudra.genfill.run`; exportaciones ONNX para DirectML, Core ML y CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RUDRA models (ACES 2 + AI fill v3) | Reconstrucción SDR→HDR y relleno de recortes | ACES 2: 2,2 MB; LoRA: 271 MB sobre base 1,3B | No aplica | Apache 2.0 | Hugging Face, app RUDRA, CLI |
| Wan2.1-VACE-1.3B | Difusión vídeo con control de referencia | 1,3B | No disponible | Apache 2.0 | Hugging Face |
| Beta 2 de FXTD Studios (`sdr2hdr_image_v8`, `sdr2hdr_shadow_v1`) | SDR→HDR previo | No disponible | No aplica | No comercial | No incluido en este repositorio |

No se dispone de datos de benchmarks comparativos con otras soluciones de inverse tone mapping en la información proporcionada.

## Limitaciones y advertencias

- AI fill v3 no recupera información real: el contenido generado es plausible, no una reconstrucción del dato original; la propia model card lo califica de experimental y desactivado por defecto.
- El relleno se limita a zonas con código 255 y a un máximo de +3 stops sobre el master; no actúa sobre recortes parciales.
- En metraje con áreas recortadas pequeñas el efecto es neutro, por lo que su utilidad práctica es acotada.
- La estimación de brillo presenta sobredesviación superior a 1 stop en el 3,3 % de los casos.
- La evaluación se basa en 25 escenas de Poly Haven; la generalización a material real de producción no está cuantificada en la información disponible.
- RUDRA ACES 2 no dispone de arquitectura ni métricas publicadas en la model card; su comportamiento fuera de la preservación de códigos de 8 bits no está documentado.
- El flujo de AI fill depende de Python, del modelo base Wan2.1-VACE-1.3B y de una GPU de 16 GB, lo que limita su despliegue en entornos modestos.
- Los pesos Beta 2 anteriores (`sdr2hdr_image_v8`, `sdr2hdr_shadow_v1`) son una release separada y no comercial; no deben confundirse con este paquete Apache 2.0.
- No se documentan sesgos, riesgos de alucinación lingüística ni limitaciones idiomáticas por tratarse de modelos de imagen; no se dispone de información sobre sesgos en la generación visual.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Wan2.1-VACE-1.3B mantiene su propia licencia Apache 2.0 de Wan-AI, que debe respetarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/fxtdstudios/rudra-models
- Repositorio RUDRA: https://github.com/FXTD-Studios/RUDRA
- Modelo base Wan2.1-VACE-1.3B-diffusers: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B-diffusers
- Licencia Poly Haven: https://polyhaven.com/license
- Sitio de FXTD Studios: https://www.fxtdstudios.com
- Carpeta RUDRA ACES 2: https://huggingface.co/fxtdstudios/rudra-models/tree/main/models/RUDRA_ACES_2
- Carpeta AI fill v3: https://huggingface.co/fxtdstudios/rudra-models/tree/main/models/rudra_genfill_v3

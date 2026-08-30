# rzhugging/php-mongodb-mssql-extensions

## Resumen

El repositorio `rzhugging/php-mongodb-mssql-extensions` no contiene un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un conjunto de binarios precompilados de extensiones PHP para conectar con MongoDB y Microsoft SQL Server (MSSQL), cubriendo PHP 7.4 a 8.3 en Windows (x64) y Linux (x64). El autor actúa como espejo de conveniencia redistribuyendo builds oficiales de PECL y deb.sury.org, incluyendo sumas SHA256 para verificación de integridad.

Dado que la plantilla de ficha técnica está diseñada exclusivamente para modelos de IA (arquitectura, parámetros, contexto, benchmarks, etc.), no procede aplicar dicha estructura a este repositorio. A continuación se ofrece una descripción técnica del contenido real del repositorio, indicando explícitamente que no hay información de modelo de IA disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (binarios bajo Apache 2.0 para MongoDB y MIT para sqlsrv/pdo_sqlsrv) |
| Formato de pesos | no disponible (binarios nativos: `.dll` y `.so`) |

## Arquitectura y entrenamiento

No aplica. El repositorio contiene binarios de extensiones PHP, no un modelo entrenado. No hay arquitectura neuronal, datos de entrenamiento ni proceso de ajuste.

## Capacidades

El repositorio proporciona:

- Extensiones `mongodb` para PHP 7.4, 8.0, 8.1, 8.2 y 8.3, en versiones 1.20.1 (PHP 7.4/8.0) y 2.4.1 (PHP 8.1–8.3) para Windows; y 1.20.1 (PHP 7.4/8.0) y 2.1.4 (PHP 8.1–8.3) para Linux.
- Extensiones `sqlsrv` y `pdo_sqlsrv` para Windows en versiones 5.10.0 (PHP 7.4/8.0), 5.12.0 (PHP 8.1/8.2) y 5.13.3 (PHP 8.3).
- Builds Windows en variantes TS (Thread Safe) y NTS (Non Thread Safe), x64.
- Builds Linux `mongodb.so` extraídos de paquetes deb.sury.org para Debian 12 (glibc, amd64), compatibles con Ubuntu y otras distribuciones glibc siempre que la versión menor de PHP coincida.
- Guía de compilación para MSSQL en Linux (`LINUX-MSSQL-BUILD.md`), ya que Microsoft distribuye `sqlsrv`/`pdo_sqlsrv` como fuente PECL.

## Casos de uso

- Entornos Windows con Apache (TS) o nginx + PHP-FPM (NTS): copiar los DLL correspondientes en `ext` y activarlos en `php.ini`.
- Entornos Linux basados en glibc: instalar `mongodb.so` en `extension_dir` y verificar con `php -m`.
- Alpine Linux (musl): los binarios no funcionan; usar `apk add php<ver>-mongodb` o `pecl install mongodb`.
- Aplicaciones PHP que requieran conectar a MongoDB sin usar la librería oficial (el manual de MongoDB recomienda la librería `mongodb/mongo-php-library` para una API completa).
- Aplicaciones PHP que necesiten acceder a SQL Server a través de ODBC (requiere Microsoft ODBC Driver 17 o 18 en Windows).
- Verificación de integridad de binarios mediante `SHA256SUMS` para despliegues reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No es un modelo de IA, por lo que no aplican métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica a modelos de IA. Para extensiones PHP, los requisitos son los del propio intérprete PHP y el sistema operativo (Windows x64 o Linux x64 con glibc).
- En Windows, se requiere Microsoft ODBC Driver 17 o 18 para las extensiones MSSQL.
- En Linux, los binarios no son compatibles con musl (Alpine).

## Comparativa con modelos similares

No disponible. No hay modelos de IA comparables porque el repositorio no contiene uno.

## Limitaciones y advertencias

- No es un modelo de IA; cualquier expectativa de capacidades de lenguaje, razonamiento o generación es incorrecta.
- Los binarios Linux son glibc y no funcionan en musl (Alpine).
- Las versiones de PHP deben coincidir exactamente con la versión menor (p. ej., PHP 8.2.x) para que las extensiones carguen.
- En Windows, las extensiones MSSQL requieren el ODBC Driver de Microsoft instalado.
- El repositorio es un espejo no oficial; las marcas pertenecen a MongoDB Inc., Microsoft y el proyecto PHP.
- No hay información sobre mantenimiento a largo plazo ni garantías de soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rzhugging/php-mongodb-mssql-extensions
- Fuente de los DLL Windows: https://downloads.php.net/~windows/pecl/releases/
- Fuente de los `.so` Linux: https://packages.sury.org/
- Librería oficial MongoDB PHP: https://github.com/mongodb/mongo-php-library
- Manual de la librería MongoDB PHP: https://www.mongodb.com/docs/php-library/current/
- Tutorial de configuración MongoDB + PHP: https://www.tutorialspoint.com/mongodb/mongodb_php.htm
